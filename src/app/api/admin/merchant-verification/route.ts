import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFullCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = { role: 'customer' };
    if (status && status !== 'all') {
      where.verificationStatus = status.toUpperCase();
    }

    const merchants = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        companyName: true,
        wilaya: true,
        address: true,
        merchantType: true,
        verificationStatus: true,
        commercialRegisterUrl: true,
        commercialRegisterName: true,
        rejectionReason: true,
        reviewedAt: true,
        reviewedBy: true,
        createdAt: true,
        _count: {
          select: { orders: true },
        },
      },
      orderBy: [{ createdAt: 'desc' }],
    });

    const pendingCount = await prisma.user.count({
      where: { role: 'customer', verificationStatus: 'PENDING' },
    });

    return NextResponse.json({ merchants, pendingCount });
  } catch (error) {
    console.error('Fetch merchants error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء جلب التجار' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
    }

    const body = await request.json();
    const { userId, action, rejectionReason, merchantType } = body;

    if (!userId || !action || !['APPROVE', 'REJECT'].includes(action)) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 });
    }

    const isApprove = action === 'APPROVE';
    const newStatus = isApprove ? 'APPROVED' : 'REJECTED';

    const updateData: any = {
      verificationStatus: newStatus,
      reviewedAt: new Date(),
      reviewedBy: user.name,
      rejectionReason: isApprove ? null : (rejectionReason?.trim() || 'الوثائق المرفوعة غير مطابقة أو غير واضحة.'),
    };

    if (merchantType && ['RETAIL', 'WHOLESALE', 'SUPER_WHOLESALE'].includes(merchantType)) {
      updateData.merchantType = merchantType;
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Create in-app notification for the merchant
    await prisma.notification.create({
      data: {
        userId: targetUser.id,
        title: isApprove ? 'تمت الموافقة على توثيق حسابك التجاري 🎉' : 'تنبيه: تم رفض طلب توثيق النشاط التجاري',
        message: isApprove
          ? `تم تفعيل حسابك كـ (${updatedUser.merchantType === 'SUPER_WHOLESALE' ? 'تاجر سوبر جملة' : updatedUser.merchantType === 'WHOLESALE' ? 'تاجر جملة' : 'تاجر تجزئة'}). يمكنك الآن الاطلاع على أسعار الجملة وإرسال الطلبيات.`
          : `تم رفض طلب التوثيق للسبب التالي: ${updateData.rejectionReason}. يرجى إعادة تقديم وثائق صالحة.`,
        type: isApprove ? 'success' : 'warning',
        link: isApprove ? '/catalog' : '/verification',
      },
    });

    return NextResponse.json({
      success: true,
      message: isApprove ? 'تمت الموافقة على التاجر بنجاح' : 'تم تسجيل رفض التاجر وإرسال السبب',
      user: updatedUser,
    });
  } catch (error) {
    console.error('Merchant verification review error:', error);
    return NextResponse.json({ error: 'حدث خطأ أثناء تحديث حالة التاجر' }, { status: 500 });
  }
}
