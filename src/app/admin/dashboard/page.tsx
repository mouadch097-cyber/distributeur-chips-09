'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Button } from '@/components/ui/Button';
import { ORDER_STATUS_MAP } from '@/lib/constants';
import {
  Users,
  ShoppingBag,
  Clock,
  CheckCircle2,
  DollarSign,
  Boxes,
  Package,
  ArrowLeft,
  Loader2,
  AlertTriangle,
  ArrowUpRight,
  XCircle,
} from 'lucide-react';

interface StatsData {
  totalCustomers: number;
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  preparingOrders: number;
  outForDeliveryOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalProducts: number;
  activeProducts: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalRevenue: number;
}

interface RevenuePoint { date: string; revenue: number; }

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData>({
    totalCustomers: 0, totalOrders: 0, pendingOrders: 0,
    confirmedOrders: 0, preparingOrders: 0, outForDeliveryOrders: 0,
    completedOrders: 0, cancelledOrders: 0, totalProducts: 0,
    activeProducts: 0, lowStockCount: 0, outOfStockCount: 0, totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [revenueChart, setRevenueChart] = useState<RevenuePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setRecentOrders(data.recentOrders || []);
          setRevenueChart(data.revenueChart || []);
        }
      } catch (e) {
        console.error('Error fetching admin stats:', e);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const maxRevenue = Math.max(...revenueChart.map(d => d.revenue), 1);

  const dayLabels: Record<string, string> = {
    '0': 'أحد', '1': 'إثنين', '2': 'ثلاثاء', '3': 'أربعاء',
    '4': 'خميس', '5': 'جمعة', '6': 'سبت',
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#08080a] text-right">
      <AdminHeader
        title="لوحة المؤشرات والإحصائيات"
        subtitle="نظرة عامة على مبيعات الجملة والطلبيات والمخزون الحقيقي"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-8 flex-1">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-amber-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <span className="text-xs text-zinc-400">جاري قراءة إحصائيات قاعدة البيانات...</span>
          </div>
        ) : (
          <>
            {/* Main Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Revenue */}
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-400/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400">
                    <DollarSign className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-zinc-500 font-bold">إجمالي المبيعات</span>
                </div>
                <div className="text-2xl font-black text-amber-400 font-mono">
                  {stats.totalRevenue.toLocaleString()} دج
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">الطلبيات غير الملغاة</p>
              </div>

              {/* Orders */}
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-400/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                    <ShoppingBag className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-zinc-500 font-bold">إجمالي الطلبيات</span>
                </div>
                <div className="text-2xl font-black text-zinc-100 font-mono">{stats.totalOrders}</div>
                <p className="text-[11px] text-zinc-500 mt-1">
                  {stats.pendingOrders} في الانتظار · {stats.completedOrders} مسلمة
                </p>
              </div>

              {/* Customers */}
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-400/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-zinc-500 font-bold">التجار المسجلين</span>
                </div>
                <div className="text-2xl font-black text-zinc-100 font-mono">{stats.totalCustomers}</div>
                <p className="text-[11px] text-zinc-500 mt-1">عملاء نشطون في المنصة</p>
              </div>

              {/* Products */}
              <div className="p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-400/40 transition-colors">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Package className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-zinc-500 font-bold">المنتجات</span>
                </div>
                <div className="text-2xl font-black text-zinc-100 font-mono">{stats.activeProducts}</div>
                <p className="text-[11px] text-zinc-500 mt-1">منتج نشط من {stats.totalProducts} إجمالي</p>
              </div>
            </div>

            {/* Stock Alerts Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* Low Stock Alert */}
              <div className={`p-5 rounded-2xl border transition-colors ${
                stats.lowStockCount > 0
                  ? 'bg-amber-500/5 border-amber-500/30 hover:border-amber-500/50'
                  : 'bg-zinc-900/90 border-zinc-800'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    stats.lowStockCount > 0
                      ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                      : 'bg-zinc-800 border border-zinc-700 text-zinc-500'
                  }`}>
                    <AlertTriangle className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-zinc-500 font-bold">مخزون منخفض</span>
                </div>
                <div className={`text-2xl font-black font-mono ${stats.lowStockCount > 0 ? 'text-amber-400' : 'text-zinc-400'}`}>
                  {stats.lowStockCount}
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">منتج يحتاج إعادة توريد</p>
                {stats.lowStockCount > 0 && (
                  <Link href="/admin/inventory" className="text-[11px] text-amber-400 hover:text-amber-300 font-bold mt-2 inline-block">
                    مراجعة المخزون ←
                  </Link>
                )}
              </div>

              {/* Out of Stock Alert */}
              <div className={`p-5 rounded-2xl border transition-colors ${
                stats.outOfStockCount > 0
                  ? 'bg-red-500/5 border-red-500/30 hover:border-red-500/50'
                  : 'bg-zinc-900/90 border-zinc-800'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    stats.outOfStockCount > 0
                      ? 'bg-red-500/10 border border-red-500/30 text-red-400'
                      : 'bg-zinc-800 border border-zinc-700 text-zinc-500'
                  }`}>
                    <XCircle className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-zinc-500 font-bold">نفاد المخزون</span>
                </div>
                <div className={`text-2xl font-black font-mono ${stats.outOfStockCount > 0 ? 'text-red-400' : 'text-zinc-400'}`}>
                  {stats.outOfStockCount}
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">منتج غير متوفر</p>
              </div>

              {/* Pending Orders Alert */}
              <div className={`p-5 rounded-2xl border transition-colors ${
                stats.pendingOrders > 0
                  ? 'bg-blue-500/5 border-blue-500/30 hover:border-blue-500/50'
                  : 'bg-zinc-900/90 border-zinc-800'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    stats.pendingOrders > 0
                      ? 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                      : 'bg-zinc-800 border border-zinc-700 text-zinc-500'
                  }`}>
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-xs text-zinc-500 font-bold">طلبيات جديدة</span>
                </div>
                <div className={`text-2xl font-black font-mono ${stats.pendingOrders > 0 ? 'text-blue-400' : 'text-zinc-400'}`}>
                  {stats.pendingOrders}
                </div>
                <p className="text-[11px] text-zinc-500 mt-1">تنتظر التأكيد</p>
                {stats.pendingOrders > 0 && (
                  <Link href="/admin/orders?status=pending" className="text-[11px] text-blue-400 hover:text-blue-300 font-bold mt-2 inline-block">
                    معالجة الطلبيات ←
                  </Link>
                )}
              </div>
            </div>

            {/* Revenue Chart + Order Status */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Revenue Chart — 7 days */}
              <div className="lg:col-span-2 rounded-2xl bg-zinc-900/90 border border-zinc-800 p-6">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2 text-amber-400">
                    <ArrowUpRight className="w-4 h-4" />
                    <span className="text-xs font-bold text-zinc-400">آخر 7 أيام</span>
                  </div>
                  <h3 className="text-base font-black text-zinc-100">منحنى المبيعات اليومية</h3>
                </div>
                {revenueChart.length === 0 || revenueChart.every(d => d.revenue === 0) ? (
                  <div className="h-32 flex items-center justify-center text-zinc-500 text-sm">
                    لا توجد مبيعات في آخر 7 أيام
                  </div>
                ) : (
                  <div className="flex items-end gap-2 h-32">
                    {revenueChart.map((point, i) => {
                      const heightPct = (point.revenue / maxRevenue) * 100;
                      const date = new Date(point.date);
                      const dayNum = date.getDay().toString();
                      const dayLabel = dayLabels[dayNum] || point.date.slice(5);
                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                          <span className="text-[9px] text-amber-400 font-mono">
                            {point.revenue > 0 ? `${(point.revenue / 1000).toFixed(0)}k` : ''}
                          </span>
                          <div className="w-full rounded-t-lg bg-zinc-800 relative" style={{ height: '80px' }}>
                            <div
                              className="absolute bottom-0 left-0 right-0 rounded-t-lg bg-amber-400 transition-all duration-700"
                              style={{ height: `${Math.max(heightPct, point.revenue > 0 ? 4 : 0)}%` }}
                            />
                          </div>
                          <span className="text-[9px] text-zinc-500">{dayLabel}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Order Status Breakdown */}
              <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-6">
                <h3 className="text-base font-black text-zinc-100 mb-5 text-right">حالات الطلبيات</h3>
                <div className="space-y-3">
                  {[
                    { label: 'في الانتظار', value: stats.pendingOrders, color: 'bg-amber-400' },
                    { label: 'مؤكدة', value: stats.confirmedOrders, color: 'bg-blue-400' },
                    { label: 'قيد التحضير', value: stats.preparingOrders, color: 'bg-purple-400' },
                    { label: 'في التوصيل', value: stats.outForDeliveryOrders, color: 'bg-orange-400' },
                    { label: 'مسلمة', value: stats.completedOrders, color: 'bg-emerald-400' },
                    { label: 'ملغاة', value: stats.cancelledOrders, color: 'bg-red-400' },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center justify-between gap-3">
                      <span className="text-xs font-mono font-bold text-zinc-300">{value}</span>
                      <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${color} transition-all duration-700`}
                          style={{ width: stats.totalOrders > 0 ? `${(value / stats.totalOrders) * 100}%` : '0%' }}
                        />
                      </div>
                      <span className="text-xs text-zinc-400 w-24 text-right">{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-zinc-100">إجراءات سريعة للإدارة</h3>
                <p className="text-xs text-zinc-400">إدارة المنتجات، متابعة شاحنات التوزيع، وتعديل المخزون</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/admin/orders?status=pending">
                  <Button variant="primary" size="sm">
                    متابعة الطلبيات ({stats.pendingOrders})
                  </Button>
                </Link>
                <Link href="/admin/products">
                  <Button variant="outline" size="sm">إدارة الأصناف</Button>
                </Link>
                <Link href="/admin/inventory">
                  <Button variant="secondary" size="sm">تعديل المخزون</Button>
                </Link>
              </div>
            </div>

            {/* Recent Orders Section */}
            <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 p-6 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                <Link
                  href="/admin/orders"
                  className="flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 font-bold"
                >
                  <span>عرض جميع الطلبيات</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </Link>
                <h3 className="text-base font-black text-zinc-100">آخر الطلبيات المسجلة</h3>
              </div>

              {recentOrders.length === 0 ? (
                <div className="py-12 text-center text-zinc-500 text-sm">
                  لا توجد طلبيات حالياً.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400">
                        <th className="pb-3 font-bold">رقم الطلبية</th>
                        <th className="pb-3 font-bold">العميل / المتجر</th>
                        <th className="pb-3 font-bold">الولاية</th>
                        <th className="pb-3 font-bold text-center">الحالة</th>
                        <th className="pb-3 font-bold text-left">المبلغ</th>
                        <th className="pb-3 font-bold text-center">إجراء</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {recentOrders.map((order) => {
                        const statusInfo = ORDER_STATUS_MAP[order.status as keyof typeof ORDER_STATUS_MAP] || {
                          label: order.status,
                          color: 'bg-zinc-800 text-zinc-300 border-zinc-700',
                        };

                        return (
                          <tr key={order.id} className="text-zinc-200 hover:bg-zinc-800/40">
                            <td className="py-3.5 font-mono font-bold text-amber-400">
                              {order.orderNumber}
                            </td>
                            <td className="py-3.5">
                              <span className="font-bold text-zinc-100 block">{order.customerName}</span>
                              <span className="text-[11px] text-zinc-500">
                                {order.user?.companyName || order.phone}
                              </span>
                            </td>
                            <td className="py-3.5 text-zinc-300">{order.wilaya}</td>
                            <td className="py-3.5 text-center">
                              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${statusInfo.color}`}>
                                {statusInfo.label}
                              </span>
                            </td>
                            <td className="py-3.5 text-left font-mono font-bold">
                              {order.totalAmount.toLocaleString()} دج
                            </td>
                            <td className="py-3.5 text-center">
                              <Link href={`/admin/orders?highlight=${order.id}`}>
                                <Button variant="outline" size="sm">إدارة</Button>
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}
