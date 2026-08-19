import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const now = new Date();
    // Return only active and non-expired offers
    const offers = await prisma.offer.findMany({
      where: {
        active: true,
        OR: [
          { validUntil: null },
          { validUntil: { gte: now } },
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ offers });
  } catch (error) {
    console.error('Offers fetch error:', error);
    return NextResponse.json({ offers: [] }, { status: 500 });
  }
}
