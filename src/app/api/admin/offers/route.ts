import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFullCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const offers = await prisma.offer.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ offers });
  } catch (error) {
    console.error('Admin offers fetch error:', error);
    return NextResponse.json({ offers: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
    const { title, arabicTitle, description, discountPercent, bundlePrice, active = true, validUntil } = body;

    if (!arabicTitle || !arabicTitle.trim()) {
      return NextResponse.json({ error: 'عنوان العرض بالعربية مطلوب' }, { status: 400 });
    }

    const offer = await prisma.offer.create({
      data: {
        arabicTitle: arabicTitle.trim(),
        title: (title || arabicTitle).trim(),
        description: description?.trim() || null,
        discountPercent: discountPercent ? parseFloat(discountPercent) : null,
        bundlePrice: bundlePrice ? parseFloat(bundlePrice) : null,
        active: Boolean(active),
        validUntil: validUntil ? new Date(validUntil) : null,
      },
    });

    return NextResponse.json({ success: true, offer });
  } catch (error) {
    console.error('Admin create offer error:', error);
    return NextResponse.json({ error: 'فشل إنشاء العرض' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
    const { id, title, arabicTitle, description, discountPercent, bundlePrice, active, validUntil } = body;

    if (!id) {
      return NextResponse.json({ error: 'معرف العرض مطلوب' }, { status: 400 });
    }

    const updateData: any = {};
    if (arabicTitle !== undefined) updateData.arabicTitle = arabicTitle.trim();
    if (title !== undefined) updateData.title = title.trim();
    if (description !== undefined) updateData.description = description?.trim() || null;
    if (discountPercent !== undefined) updateData.discountPercent = discountPercent ? parseFloat(discountPercent) : null;
    if (bundlePrice !== undefined) updateData.bundlePrice = bundlePrice ? parseFloat(bundlePrice) : null;
    if (typeof active === 'boolean') updateData.active = active;
    if (validUntil !== undefined) updateData.validUntil = validUntil ? new Date(validUntil) : null;

    const offer = await prisma.offer.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, offer });
  } catch (error) {
    console.error('Admin update offer error:', error);
    return NextResponse.json({ error: 'فشل تحديث العرض' }, { status: 500 });
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
    if (!id) return NextResponse.json({ error: 'معرف العرض مطلوب' }, { status: 400 });

    await prisma.offer.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'تم حذف العرض بنجاح' });
  } catch (error) {
    console.error('Admin delete offer error:', error);
    return NextResponse.json({ error: 'فشل حذف العرض' }, { status: 500 });
  }
}
