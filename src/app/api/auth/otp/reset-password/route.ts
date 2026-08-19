import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPasswordResetSessionToken, hashPassword } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const body = await request.json();
    const { resetToken, password, confirmPassword } = body;

    if (!resetToken || !password) {
      return NextResponse.json({ error: 'بيانات غير مكتملة.' }, { status: 400 });
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'يجب أن تتكون كلمة المرور من 8 أحرف على الأقل.' },
        { status: 400 }
      );
    }

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json(
        { error: 'كلمتا المرور غير متطابقتين.' },
        { status: 400 }
      );
    }

    // Rate limiting
    const rateLimit = checkRateLimit(`otp_reset_pw_${ip}`, 10, 10 * 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'محاولات كثيرة جداً. يرجى الانتظار.' },
        { status: 429 }
      );
    }

    // Verify cryptographic reset session token
    const tokenPayload = await verifyPasswordResetSessionToken(resetToken);
    if (!tokenPayload || tokenPayload.purpose !== 'password_reset') {
      return NextResponse.json(
        { error: 'جلسة إعادة التعيين غير صالحة أو انتهت مدتها. يرجى طلب رمز تحقق جديد.' },
        { status: 401 }
      );
    }

    // Verify OTP record state in DB
    const otpRecord = await prisma.passwordResetOtp.findUnique({
      where: { id: tokenPayload.otpId },
    });

    if (!otpRecord || !otpRecord.verifiedAt) {
      return NextResponse.json(
        { error: 'رمز التحقق غير مفعل أو تم استخدامه مسبقاً.' },
        { status: 400 }
      );
    }

    // Hash new password securely (bcrypt cost 12)
    const newPasswordHash = await hashPassword(password);

    // Atomically update password and delete OTP records for this user
    await prisma.$transaction([
      prisma.user.update({
        where: { id: tokenPayload.userId },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.passwordResetOtp.deleteMany({
        where: { userId: tokenPayload.userId },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.',
    });
  } catch (error) {
    console.error('Password reset with OTP error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حفظ كلمة المرور الجديدة.' },
      { status: 500 }
    );
  }
}
