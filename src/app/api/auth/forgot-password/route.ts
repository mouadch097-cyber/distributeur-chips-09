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

    const rateLimit = checkRateLimit(`forgot_pw_${cleanEmail}_${ip}`, 5, 60 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'تم تجاوز الحد الأقصى للمحاولات. يرجى المحاولة بعد ساعة.' },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (user && user.active) {
      const otpCode = generateSixDigitOtp();
      const otpHash = hashOtp(otpCode);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

      // Invalidate previous OTPs
      await prisma.passwordResetOtp.deleteMany({
        where: { userId: user.id },
      });

      const createdOtp = await prisma.passwordResetOtp.create({
        data: {
          userId: user.id,
          otpHash,
          expiresAt,
          attempts: 0,
        },
      });

      const emailResult = await sendPasswordResetOtpEmail(user.email, user.name, otpCode);
      if (!emailResult.success) {
        console.error(`[Forgot Password] Failed to send OTP to ${cleanEmail}: ${emailResult.error}`);
        
        await prisma.passwordResetOtp.deleteMany({
          where: { id: createdOtp.id },
        });

        return NextResponse.json(
          {
            error:
              'تعذر إرسال رمز التحقق إلى بريدك الإلكتروني حالياً بسبب خطأ في خادم البريد. يرجى المحاولة لاحقاً.',
          },
          { status: 502 }
        );
      }
    }

    // Return generic response
    return NextResponse.json({
      success: true,
      message: 'إذا كان البريد الإلكتروني مسجلاً لدينا، فسيتم إرسال رمز التحقق إليه.',
      email: cleanEmail,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ غير متوقع أثناء معالجة الطلب.' },
      { status: 500 }
    );
  }
}
