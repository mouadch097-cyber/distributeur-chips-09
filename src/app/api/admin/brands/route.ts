import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFullCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      include: { _count: { select: { products: true } } },
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ brands });
  } catch (error) {
    console.error('Brands fetch error:', error);
    return NextResponse.json({ brands: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح: إدارة العلامات مخصصة للمدير فقط' }, { status: 403 });
    }

    const { name, arabicName, slug, logoUrl, description, active = true } = await request.json();
    if (!name || !name.trim() || !arabicName || !arabicName.trim()) {
      return NextResponse.json({ error: 'اسم العلامة بالعربية واللاتينية مطلوب.' }, { status: 400 });
    }

    const cleanSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!cleanSlug) {
      return NextResponse.json({ error: 'الرمز التعريفي (slug) غير صالح.' }, { status: 400 });
    }

    // Duplicate check
    const existing = await prisma.brand.findFirst({
      where: {
        OR: [
          { slug: cleanSlug },
          { name: { equals: name.trim(), mode: 'insensitive' } },
          { arabicName: arabicName.trim() },
        ],
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'هذه العلامة التجارية مسجلة مسبقاً في النظام.' }, { status: 400 });
    }

    const brand = await prisma.brand.create({
      data: {
        name: name.trim(),
        arabicName: arabicName.trim(),
        slug: cleanSlug,
        logoUrl: logoUrl?.trim() || null,
        description: description?.trim() || null,
        active: Boolean(active),
      },
      include: { _count: { select: { products: true } } },
    });

    return NextResponse.json({ success: true, brand });
  } catch (error) {
    console.error('Create brand error:', error);
    return NextResponse.json({ error: 'فشل إنشاء العلامة التجارية' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح: إدارة العلامات مخصصة للمدير فقط' }, { status: 403 });
    }

    const { id, name, arabicName, logoUrl, description, active } = await request.json();
    if (!id) return NextResponse.json({ error: 'معرف العلامة مطلوب' }, { status: 400 });

    const updateData: any = {};
    if (name !== undefined) updateData.name = name.trim();
    if (arabicName !== undefined) updateData.arabicName = arabicName.trim();
    if (logoUrl !== undefined) updateData.logoUrl = logoUrl?.trim() || null;
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (typeof active === 'boolean') updateData.active = active;

    const brand = await prisma.brand.update({
      where: { id },
      data: updateData,
      include: { _count: { select: { products: true } } },
    });
    return NextResponse.json({ success: true, brand });
  } catch (error) {
    console.error('Update brand error:', error);
    return NextResponse.json({ error: 'فشل تحديث العلامة التجارية' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح: إدارة العلامات مخصصة للمدير فقط' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'معرف العلامة مطلوب' }, { status: 400 });

    // Check linked products
    const linkedProductsCount = await prisma.product.count({ where: { brandId: id } });

    if (linkedProductsCount > 0) {
      // Relation protected: Soft delete / active = false
      await prisma.brand.update({
        where: { id },
        data: { active: false },
      });
      return NextResponse.json({
        success: true,
        message: 'تم تعطيل العلامة التجارية بنجاح مع الحفاظ على المنتجات وسجلات المبيعات المرتبطة بها.',
        softDeleted: true,
      });
    } else {
      // Safe to hard delete
      await prisma.brand.delete({ where: { id } });
      return NextResponse.json({
        success: true,
        message: 'تم حذف العلامة التجارية نهائياً.',
        deleted: true,
      });
    }
  } catch (error) {
    console.error('Delete brand error:', error);
    return NextResponse.json({ error: 'فشل حذف العلامة التجارية' }, { status: 500 });
  }
}
