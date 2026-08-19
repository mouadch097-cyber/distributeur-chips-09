import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashOtp, createPasswordResetSessionToken } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const body = await request.json();
    const { email, otp } = body;

    if (!email || !otp || typeof otp !== 'string' || otp.trim().length !== 6) {
      return NextResponse.json(
        { error: 'يرجى إدخال رمز التحقق المكون من 6 أرقام.' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanOtp = otp.trim();

    // Brute force protection: Max 10 verification attempts per IP/Email in 10 minutes
    const rateLimit = checkRateLimit(`otp_verify_${cleanEmail}_${ip}`, 10, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'محاولات تحقق كثيرة جداً. يرجى الانتظار.' },
        { status: 429 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (!user) {
      return NextResponse.json({ error: 'رمز التحقق غير صحيح أو انتهت صلاحيته.' }, { status: 400 });
    }

    // Find the active OTP for this user
    const otpRecord = await prisma.passwordResetOtp.findFirst({
      where: {
        userId: user.id,
        verifiedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'لا يوجد رمز تحقق نشط لهذا البريد. يرجى طلب رمز جديد.' },
        { status: 400 }
      );
    }

    // Check expiration
    if (new Date() > otpRecord.expiresAt) {
      return NextResponse.json(
        { error: 'انتهت صلاحية رمز التحقق (صالح لمدة 10 دقائق فقط). يرجى طلب رمز جديد.' },
        { status: 400 }
      );
    }

    // Check max attempts per OTP (Max 5 attempts)
    if (otpRecord.attempts >= 5) {
      return NextResponse.json(
        { error: 'تم تجاوز الحد الأقصى للمحاولات لهذا الرمز. يرجى طلب رمز جديد.' },
        { status: 400 }
      );
    }

    // Verify OTP Hash
    const computedHash = hashOtp(cleanOtp);
    if (computedHash !== otpRecord.otpHash) {
      // Increment attempt counter
      await prisma.passwordResetOtp.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });

      const remainingAttempts = 4 - otpRecord.attempts;
      return NextResponse.json(
        {
          error: `رمز التحقق غير صحيح. المحاولات المتبقية: ${Math.max(0, remainingAttempts)}`,
        },
        { status: 400 }
      );
    }

    // Mark OTP as verified in database
    await prisma.passwordResetOtp.update({
      where: { id: otpRecord.id },
      data: { verifiedAt: new Date() },
    });

    // Create cryptographically signed short-lived reset session token (15 mins)
    const resetToken = await createPasswordResetSessionToken({
      userId: user.id,
      email: user.email,
      otpId: otpRecord.id,
      purpose: 'password_reset',
    });

    return NextResponse.json({
      success: true,
      message: 'تم التحقق من الرمز بنجاح.',
      resetToken,
    });
  } catch (error) {
    console.error('OTP Verification error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء التحقق من الرمز.' },
      { status: 500 }
    );
  }
}
