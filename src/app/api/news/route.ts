import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const news = await prisma.news.findMany({
      where: { published: true },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ news });
  } catch (error) {
    console.error('News fetch error:', error);
    return NextResponse.json({ news: [] }, { status: 500 });
  }
}
