import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFullCurrentUser } from '@/lib/auth';

export async function GET() {
  const user = await getFullCurrentUser();
  if (!user || user.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } });
  return NextResponse.json({ categories });
}

export async function POST(request: NextRequest) {
  const user = await getFullCurrentUser();
  if (!user || user.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const body = await request.json();
  const { name, arabicName, slug, description } = body;

  if (!name || !arabicName || !slug)
    return NextResponse.json({ error: 'جميع الحقول مطلوبة' }, { status: 400 });

  const category = await prisma.category.create({
    data: {
      name: name.trim(),
      arabicName: arabicName.trim(),
      slug: slug.trim(),
      description: description?.trim() || null,
      active: true,
    },
  });

  return NextResponse.json({ success: true, category });
}

export async function PUT(request: NextRequest) {
  const user = await getFullCurrentUser();
  if (!user || user.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const { id, ...data } = await request.json();
  if (!id) return NextResponse.json({ error: 'معرف الفئة مطلوب' }, { status: 400 });

  const category = await prisma.category.update({ where: { id }, data });
  return NextResponse.json({ success: true, category });
}

export async function DELETE(request: NextRequest) {
  const user = await getFullCurrentUser();
  if (!user || user.role !== 'admin')
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'معرف الفئة مطلوب' }, { status: 400 });

  try {
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'لا يمكن حذف فئة مرتبطة بمنتجات' }, { status: 409 });
  }
}
