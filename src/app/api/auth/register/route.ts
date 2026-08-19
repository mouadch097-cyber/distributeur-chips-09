import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashPassword, createSessionToken, setSessionCookie } from '@/lib/auth';
import { registerSchema } from '@/lib/validations';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request.headers);
    const rateLimit = checkRateLimit(`register_${ip}`, 5, 60 * 1000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'تم تجاوز الحد الأقصى للمحاولات. يرجى الانتظار دقيقة واحدة.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      const errorMessage = validation.error.errors[0]?.message || 'بيانات غير صالحة';
      return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { fullName, email, phone, companyName, wilaya, address, password } = validation.data;
    const cleanEmail = email.toLowerCase().trim();

    // Check duplicate email
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مسجل مسبقاً. يرجى تسجيل الدخول أو استخدام بريد آخر.' },
        { status: 400 }
      );
    }

    const passwordHash = await hashPassword(password);

    // CRITICAL: Always enforce role = 'customer' for new registrations
    const user = await prisma.user.create({
      data: {
        name: fullName.trim(),
        email: cleanEmail,
        passwordHash,
        phone: phone.trim(),
        companyName: companyName?.trim() || null,
        wilaya: wilaya.trim(),
        address: address.trim(),
        role: 'customer', // Never allow privileged role creation from client
        active: true,
      },
    });

    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    });

    await setSessionCookie(token);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الحساب، يرجى المحاولة لاحقاً.' },
      { status: 500 }
    );
  }
}
