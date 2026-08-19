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

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: true,
                flavor: true,
              },
            },
          },
        },
        invoice: true,
        driver: true,
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'الطلبية غير موجودة' }, { status: 404 });
    }

    // IDOR Protection: Customers can ONLY access their own orders
    if (user.role !== 'admin' && order.userId !== user.id) {
      return NextResponse.json({ error: 'غير مصرح بالوصول إلى هذه الطلبية' }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Fetch order details error:', error);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
