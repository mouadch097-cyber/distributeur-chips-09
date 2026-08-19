import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFullCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const flavors = await prisma.flavor.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { name: 'asc' },
    });
    return NextResponse.json({ flavors });
  } catch (error) {
    console.error('Flavors fetch error:', error);
    return NextResponse.json({ flavors: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { name, arabicName, slug, color } = await request.json();
    if (!name || !name.trim() || !arabicName || !arabicName.trim()) {
      return NextResponse.json({ error: 'اسم النكهة بالعربية واللاتينية مطلوب.' }, { status: 400 });
    }

    const cleanSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!cleanSlug) {
      return NextResponse.json({ error: 'المعرف الفريد (slug) غير صالح.' }, { status: 400 });
    }

    // Duplicate check
    const existing = await prisma.flavor.findFirst({
      where: {
        OR: [
          { slug: cleanSlug },
          { name: { equals: name.trim(), mode: 'insensitive' } },
          { arabicName: arabicName.trim() },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'هذه النكهة موجودة مسبقاً في النظام.' }, { status: 400 });
    }

    const flavor = await prisma.flavor.create({
      data: {
        name: name.trim(),
        arabicName: arabicName.trim(),
        slug: cleanSlug,
        color: color?.trim() || '#eab308',
        active: true,
      },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json({ success: true, flavor });
  } catch (error) {
    console.error('Create flavor error:', error);
    return NextResponse.json({ error: 'فشل إضافة النكهة' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { id, name, arabicName, color, active } = await request.json();
    if (!id) return NextResponse.json({ error: 'معرف النكهة مطلوب' }, { status: 400 });

    const updateData: any = {};
    if (name) updateData.name = name.trim();
    if (arabicName) updateData.arabicName = arabicName.trim();
    if (color) updateData.color = color.trim();
    if (typeof active === 'boolean') updateData.active = active;

    const flavor = await prisma.flavor.update({
      where: { id },
      data: updateData,
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json({ success: true, flavor });
  } catch (error) {
    console.error('Update flavor error:', error);
    return NextResponse.json({ error: 'فشل تحديث النكهة' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'معرف النكهة مطلوب' }, { status: 400 });

    // Check linked products
    const linkedProductsCount = await prisma.product.count({ where: { flavorId: id } });

    if (linkedProductsCount > 0) {
      // Products are linked: soft delete / toggle inactive to keep product association safe
      await prisma.flavor.update({
        where: { id },
        data: { active: false },
      });
      return NextResponse.json({
        success: true,
        message: 'تم تعطيل النكهة بنجاح مع الحفاظ على المنتجات المرتبطة بها.',
        softDeleted: true,
      });
    } else {
      // Safe to hard delete
      await prisma.flavor.delete({ where: { id } });
      return NextResponse.json({
        success: true,
        message: 'تم حذف النكهة نهائياً.',
        deleted: true,
      });
    }
  } catch (error) {
    console.error('Delete flavor error:', error);
    return NextResponse.json({ error: 'فشل حذف النكهة' }, { status: 500 });
  }
}
