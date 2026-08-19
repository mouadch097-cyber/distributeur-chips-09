import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFullCurrentUser } from '@/lib/auth';

// Valid order status transitions map
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export async function GET(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            companyName: true,
            wilaya: true,
          },
        },
        driver: true,
        invoice: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const drivers = await prisma.driver.findMany({
      where: { active: true },
      orderBy: { name: 'asc' },
    });

    return NextResponse.json({ orders, drivers });
  } catch (error) {
    console.error('Admin orders fetch error:', error);
    return NextResponse.json({ orders: [], drivers: [] }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
    const { orderId, status, driverId } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'معرف الطلبية مطلوب' }, { status: 400 });
    }

    // Fetch existing order to validate transition
    const existingOrder = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!existingOrder) {
      return NextResponse.json({ error: 'الطلبية غير موجودة' }, { status: 404 });
    }

    const updateData: any = {};

    // Validate status transition if changing
    if (status && status !== existingOrder.status) {
      const allowed = VALID_TRANSITIONS[existingOrder.status] || [];
      if (!allowed.includes(status)) {
        return NextResponse.json(
          {
            error: `لا يمكن نقل الطلبية مباشرة من حالة "${existingOrder.status}" إلى "${status}".`,
          },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    // Validate driver if assigning
    if (driverId !== undefined) {
      if (driverId === null || driverId === '') {
        updateData.driverId = null;
      } else {
        const activeDriver = await prisma.driver.findFirst({
          where: { id: driverId, active: true },
        });

        if (!activeDriver) {
          return NextResponse.json(
            { error: 'لا يمكن تعيين هذا السائق لأنه غير نشط أو غير موجود في النظام.' },
            { status: 400 }
          );
        }
        updateData.driverId = driverId;
      }
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: true,
        user: true,
        driver: true,
      },
    });

    // Create real notification for customer
    if (status && status !== existingOrder.status) {
      const statusLabels: Record<string, string> = {
        confirmed: 'تم تأكيد طلبيتكم',
        preparing: 'طلبيتكم قيد التحضير في المستودع',
        out_for_delivery: 'الشاحنة خرجت لتوصيل طلبيتكم',
        delivered: 'تم تسليم طلبيتكم بنجاح',
        cancelled: 'تم إلغاء الطلبية',
      };

      if (statusLabels[status]) {
        await prisma.notification.create({
          data: {
            userId: updated.userId,
            title: statusLabels[status],
            message: `تحديث لحالة الطلبية رقم ${updated.orderNumber}: ${statusLabels[status]}`,
            link: `/orders/${updated.id}`,
            type: 'status_change',
          },
        });
      }
    }

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error('Admin update order error:', error);
    return NextResponse.json({ error: 'فشل تحديث الطلبية' }, { status: 500 });
  }
}
