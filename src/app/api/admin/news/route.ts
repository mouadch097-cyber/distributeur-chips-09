import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFullCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const news = await prisma.news.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ news });
  } catch (error) {
    console.error('Admin news fetch error:', error);
    return NextResponse.json({ news: [] }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
    const { title, arabicTitle, content, arabicContent, published = true } = body;

    if (!arabicTitle || !arabicTitle.trim() || !arabicContent || !arabicContent.trim()) {
      return NextResponse.json(
        { error: 'عنوان الإعلان والمحتوى بالعربية مطلوبان.' },
        { status: 400 }
      );
    }

    const newsItem = await prisma.news.create({
      data: {
        arabicTitle: arabicTitle.trim(),
        title: (title || arabicTitle).trim(),
        arabicContent: arabicContent.trim(),
        content: (content || arabicContent).trim(),
        published: Boolean(published),
      },
    });

    return NextResponse.json({ success: true, news: newsItem });
  } catch (error) {
    console.error('Admin create news error:', error);
    return NextResponse.json({ error: 'فشل إضافة الإعلان' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
    const { id, title, arabicTitle, content, arabicContent, published } = body;

    if (!id) {
      return NextResponse.json({ error: 'معرف الإعلان مطلوب' }, { status: 400 });
    }

    const updateData: any = {};
    if (arabicTitle !== undefined) updateData.arabicTitle = arabicTitle.trim();
    if (title !== undefined) updateData.title = title.trim();
    if (arabicContent !== undefined) updateData.arabicContent = arabicContent.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (typeof published === 'boolean') updateData.published = published;

    const newsItem = await prisma.news.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, news: newsItem });
  } catch (error) {
    console.error('Admin update news error:', error);
    return NextResponse.json({ error: 'فشل تحديث الإعلان' }, { status: 500 });
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
    if (!id) return NextResponse.json({ error: 'معرف الإعلان مطلوب' }, { status: 400 });

    await prisma.news.delete({ where: { id } });
    return NextResponse.json({ success: true, message: 'تم حذف الإعلان بنجاح.' });
  } catch (error) {
    console.error('Admin delete news error:', error);
    return NextResponse.json({ error: 'فشل حذف الإعلان' }, { status: 500 });
  }
}
