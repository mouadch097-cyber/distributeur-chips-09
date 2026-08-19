import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { resetPasswordSchema } from '@/lib/validations';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const rateLimit = checkRateLimit(`reset_pw_${ip}`, 10, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'محاولات كثيرة. يرجى الانتظار قليلاً.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      const errorMsg = validation.error.errors[0]?.message || 'بيانات غير صالحة';
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { token, password } = validation.data;

    // Find valid, unexpired and unused token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.usedAt !== null) {
      return NextResponse.json(
        { error: 'رابط إعادة التعيين غير صالح أو تم استخدامه مسبقاً.' },
        { status: 400 }
      );
    }

    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json(
        { error: 'انتهت صلاحية رابط إعادة تعيين كلمة المرور (صالح لمدة 60 دقيقة فقط). يرجى طلب رابط جديد.' },
        { status: 400 }
      );
    }

    const newPasswordHash = await hashPassword(password);

    // Update password and mark token as used atomically
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash: newPasswordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إعادة تعيين كلمة المرور.' },
      { status: 500 }
    );
  }
}
