import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyPassword, hashPassword, createSessionToken, setSessionCookie } from '@/lib/auth';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const rateLimit = checkRateLimit(`admin_login_${ip}`, 10, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'محاولات دخول كثيرة. يرجى الانتظار دقيقة واحدة.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { email, password, secretCode } = body;

    if (!email || !password || !secretCode) {
      return NextResponse.json(
        { error: 'يرجى إدخال جميع الحقول المطلوبة (البريد، كلمة المرور، والكود السري).' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const serverAdminSecret = process.env.ADMIN_DEFAULT_SECRET_CODE;

    // Server-side verification of the admin secret code
    if (!serverAdminSecret || secretCode.trim() !== serverAdminSecret.trim()) {
      return NextResponse.json(
        { error: 'الكود السري للإدارة غير صحيح أو بيانات الدخول خاطئة.' },
        { status: 401 }
      );
    }

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (user) {
      if (user.passwordHash) {
        const isValidPassword = await verifyPassword(password, user.passwordHash);
        if (!isValidPassword) {
          // If the secret code was 100% correct, allow setting/updating the admin password
          const newHashedPassword = await hashPassword(password);
          user = await prisma.user.update({
            where: { id: user.id },
            data: {
              role: 'admin',
              passwordHash: newHashedPassword,
              active: true,
            },
          });
        } else if (user.role !== 'admin') {
          user = await prisma.user.update({
            where: { id: user.id },
            data: { role: 'admin' },
          });
        }
      } else {
        const newHashedPassword = await hashPassword(password);
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            role: 'admin',
            passwordHash: newHashedPassword,
            active: true,
          },
        });
      }
    } else {
      // First-time admin creation via secret code
      const hashedPassword = await hashPassword(password);
      user = await prisma.user.create({
        data: {
          email: cleanEmail,
          name: 'مدير المنصة',
          passwordHash: hashedPassword,
          role: 'admin',
          active: true,
        },
      });
    }

    // Create secure admin session
    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      role: 'admin',
      name: user.name,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      redirect: '/admin/dashboard',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'admin',
      },
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء معالجة تسجيل دخول الإدارة.' },
      { status: 500 }
    );
  }
}
