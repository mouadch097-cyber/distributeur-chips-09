import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getFullCurrentUser } from '@/lib/auth';

export async function GET() {
  try {
    const user = await getFullCurrentUser();
    if (!user || user.role !== 'admin') {
      return NextResponse.json({ error: 'غير مصرح: لوحة الإدارة مخصصة للمدير فقط' }, { status: 403 });
    }

    const [
      totalCustomers,
      totalOrders,
      pendingOrders,
      confirmedOrders,
      preparingOrders,
      outForDeliveryOrders,
      completedOrders,
      cancelledOrders,
      totalProducts,
      activeProducts,
      revenueAggregate,
      recentOrders,
    ] = await Promise.all([
      prisma.user.count({ where: { role: 'customer', active: true } }),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'pending' } }),
      prisma.order.count({ where: { status: 'confirmed' } }),
      prisma.order.count({ where: { status: 'preparing' } }),
      prisma.order.count({ where: { status: 'out_for_delivery' } }),
      prisma.order.count({ where: { status: 'delivered' } }),
      prisma.order.count({ where: { status: 'cancelled' } }),
      prisma.product.count(),
      prisma.product.count({ where: { active: true } }),
      prisma.order.aggregate({
        where: { status: { not: 'cancelled' } },
        _sum: { totalAmount: true },
      }),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: {
          items: { include: { product: { select: { arabicName: true } } } },
          user: { select: { name: true, phone: true, companyName: true, wilaya: true } },
          driver: { select: { name: true } },
        },
      }),
    ]);

    // Low stock and out of stock
    const productStocks = await prisma.product.findMany({
      select: { id: true, stock: true, lowStockThreshold: true, active: true },
    });
    const lowStockCount = productStocks.filter(
      (p) => p.active && p.stock > 0 && p.stock <= p.lowStockThreshold
    ).length;
    const outOfStockCount = productStocks.filter((p) => p.active && p.stock === 0).length;

    // Revenue per day for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const recentRevenue = await prisma.order.findMany({
      where: {
        status: { not: 'cancelled' },
        createdAt: { gte: sevenDaysAgo },
      },
      select: { totalAmount: true, createdAt: true },
    });

    // Group revenue by day (last 7 days)
    const revenueByDay: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      revenueByDay[key] = 0;
    }
    for (const order of recentRevenue) {
      const key = order.createdAt.toISOString().slice(0, 10);
      if (revenueByDay[key] !== undefined) {
        revenueByDay[key] += order.totalAmount;
      }
    }
    const revenueChart = Object.entries(revenueByDay).map(([date, revenue]) => ({ date, revenue }));

    return NextResponse.json({
      stats: {
        totalCustomers,
        totalOrders,
        pendingOrders,
        confirmedOrders,
        preparingOrders,
        outForDeliveryOrders,
        completedOrders,
        cancelledOrders,
        totalProducts,
        activeProducts,
        lowStockCount,
        outOfStockCount,
        totalRevenue: revenueAggregate._sum.totalAmount || 0,
      },
      recentOrders,
      revenueChart,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      {
        stats: {
          totalCustomers: 0, totalOrders: 0, pendingOrders: 0,
          confirmedOrders: 0, preparingOrders: 0, outForDeliveryOrders: 0,
          completedOrders: 0, cancelledOrders: 0, totalProducts: 0,
          activeProducts: 0, lowStockCount: 0, outOfStockCount: 0, totalRevenue: 0,
        },
        recentOrders: [],
        revenueChart: [],
      },
      { status: 500 }
    );
  }
}
