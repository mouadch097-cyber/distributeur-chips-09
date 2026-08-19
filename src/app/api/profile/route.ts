import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFullCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getFullCurrentUser();
  if (!user) return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      companyName: true,
      wilaya: true,
      address: true,
      role: true,
      active: true,
      createdAt: true,
    },
  });

  if (!profile) return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
  return NextResponse.json({ user: profile });
}

export async function PUT(request: NextRequest) {
  const user = await getFullCurrentUser();
  if (!user) return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });

  const body = await request.json();
  const { name, phone, companyName, wilaya, address } = body;

  if (!name || name.trim().length < 2)
    return NextResponse.json({ error: 'الاسم يجب أن يكون حرفين على الأقل' }, { status: 400 });

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: name.trim(),
      phone: phone?.trim() || null,
      companyName: companyName?.trim() || null,
      wilaya: wilaya?.trim() || null,
      address: address?.trim() || null,
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      companyName: true,
      wilaya: true,
      address: true,
      role: true,
    },
  });

  return NextResponse.json({ success: true, user: updated });
}
