import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFullCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getFullCurrentUser();
  if (!user) return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });

  const addresses = await prisma.customerAddress.findMany({
    where: { userId: user.id },
    orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
  });

  return NextResponse.json({ addresses });
}

export async function POST(request: NextRequest) {
  const user = await getFullCurrentUser();
  if (!user) return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });

  const body = await request.json();
  const { title, wilaya, address, phone, isDefault } = body;

  if (!wilaya || !address || !phone)
    return NextResponse.json({ error: 'يرجى ملء جميع الحقول المطلوبة' }, { status: 400 });

  if (isDefault) {
    await prisma.customerAddress.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });
  }

  const newAddress = await prisma.customerAddress.create({
    data: {
      userId: user.id,
      title: title?.trim() || 'عنوان جديد',
      wilaya: wilaya.trim(),
      address: address.trim(),
      phone: phone.trim(),
      isDefault: isDefault || false,
    },
  });

  return NextResponse.json({ success: true, address: newAddress });
}

export async function PUT(request: NextRequest) {
  const user = await getFullCurrentUser();
  if (!user) return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });

  const body = await request.json();
  const { id, title, wilaya, address, phone, isDefault } = body;
  if (!id) return NextResponse.json({ error: 'معرف العنوان مطلوب' }, { status: 400 });

  if (isDefault) {
    await prisma.customerAddress.updateMany({
      where: { userId: user.id },
      data: { isDefault: false },
    });
  }

  // IDOR safe update: strictly scoped to userId
  const updated = await prisma.customerAddress.updateMany({
    where: { id, userId: user.id },
    data: {
      ...(title !== undefined && { title: title.trim() }),
      ...(wilaya !== undefined && { wilaya: wilaya.trim() }),
      ...(address !== undefined && { address: address.trim() }),
      ...(phone !== undefined && { phone: phone.trim() }),
      ...(typeof isDefault === 'boolean' && { isDefault }),
    },
  });

  return NextResponse.json({ success: true, updated });
}

export async function DELETE(request: NextRequest) {
  const user = await getFullCurrentUser();
  if (!user) return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'معرف العنوان مطلوب' }, { status: 400 });

  // IDOR: only delete own addresses
  await prisma.customerAddress.deleteMany({ where: { id, userId: user.id } });
  return NextResponse.json({ success: true });
}
