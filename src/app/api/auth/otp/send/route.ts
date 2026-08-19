import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { generateSixDigitOtp, hashOtp } from '@/lib/auth';
import { forgotPasswordSchema } from '@/lib/validations';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import { sendPasswordResetOtpEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const body = await request.json();

    const validation = forgotPasswordSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'يرجى إدخال بريد إلكتروني صحيح.' },
        { status: 400 }
      );
    }

    const cleanEmail = validation.data.email.toLowerCase().trim();

    // Rate Limit: 5 OTP requests per hour per email/IP
    const rateLimit = checkRateLimit(`otp_send_${cleanEmail}_${ip}`, 5, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'تم تجاوز الحد الأقصى لطلب رموز التحقق. يرجى المحاولة بعد ساعة.' },
        { status: 429 }
      );
    }

    // Lookup user in database
    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user || !user.active) {
      // Account enumeration protection: return generic success without leaking account existence
      return NextResponse.json({
        success: true,
        message: 'إذا كان البريد الإلكتروني مسجلاً لدينا، فسيصلك رمز التحقق المكون من 6 أرقام.',
        email: cleanEmail,
      });
    }

    // Generate random 6-digit OTP
    const otpCode = generateSixDigitOtp();
    const otpHash = hashOtp(otpCode);
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Invalidate any previous OTPs for this user
    await prisma.passwordResetOtp.deleteMany({
      where: { userId: user.id },
    });

    // Store only the SHA-256 hash in database
    const createdOtp = await prisma.passwordResetOtp.create({
      data: {
        userId: user.id,
        otpHash,
        expiresAt,
        attempts: 0,
      },
    });

    // Send original 6-digit OTP via Resend
    const emailResult = await sendPasswordResetOtpEmail(user.email, user.name, otpCode);

    if (!emailResult.success) {
      console.error(`[Forgot Password] Failed to send OTP to ${cleanEmail}: ${emailResult.error}`);
      
      // Database consistency: Delete the OTP record since delivery failed
      await prisma.passwordResetOtp.deleteMany({
        where: { id: createdOtp.id },
      });

      return NextResponse.json(
        {
          error:
            'تعذر إرسال رمز التحقق إلى بريدك الإلكتروني حالياً بسبب خطأ في خادم البريد. يرجى المحاولة مرة أخرى لاحقاً.',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'تم إرسال رمز التحقق المكون من 6 أرقام إلى بريدك الإلكتروني بنجاح.',
      email: cleanEmail,
    });
  } catch (error) {
    console.error('OTP Send error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع أثناء معالجة الطلب.' },
      { status: 500 }
    );
  }
}
