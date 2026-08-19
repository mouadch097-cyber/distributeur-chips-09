import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFullCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getFullCurrentUser();
  if (!user) return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    include: { product: { include: { brand: true, flavor: true } } },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ favorites });
}

export async function POST(request: NextRequest) {
  const user = await getFullCurrentUser();
  if (!user) return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });

  const { productId } = await request.json();
  if (!productId) return NextResponse.json({ error: 'معرف المنتج مطلوب' }, { status: 400 });

  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product) return NextResponse.json({ error: 'المنتج غير موجود' }, { status: 404 });

  const favorite = await prisma.favorite.upsert({
    where: { userId_productId: { userId: user.id, productId } },
    update: {},
    create: { userId: user.id, productId },
  });

  return NextResponse.json({ success: true, favorite });
}

export async function DELETE(request: NextRequest) {
  const user = await getFullCurrentUser();
  if (!user) return NextResponse.json({ error: 'يجب تسجيل الدخول' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('productId');
  if (!productId) return NextResponse.json({ error: 'معرف المنتج مطلوب' }, { status: 400 });

  await prisma.favorite.deleteMany({ where: { userId: user.id, productId } });
  return NextResponse.json({ success: true });
}
