import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFullCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getFullCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
    }

    const { id } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            companyName: true,
            wilaya: true,
            address: true,
          },
        },
        order: {
          include: {
            items: true,
          },
        },
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: 'الفاتورة غير موجودة' }, { status: 404 });
    }

    // IDOR Protection
    if (user.role !== 'admin' && invoice.userId !== user.id) {
      return NextResponse.json({ error: 'غير مصرح بالوصول إلى هذه الفاتورة' }, { status: 403 });
    }

    return NextResponse.json({ invoice });
  } catch (error) {
    console.error('Invoice details error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
