import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFullCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const where: any = {};
    if (user.role !== 'admin') {
      where.userId = user.id; // IDOR Protection
    }

    const invoices = await prisma.invoice.findMany({
      where,
      include: {
        order: {
          include: {
            items: true,
          },
        },
      },
      orderBy: { issuedAt: 'desc' },
    });

    return NextResponse.json({ invoices });
  } catch (error) {
    console.error('Fetch invoices error:', error);
    return NextResponse.json({ invoices: [] }, { status: 500 });
  }
}
