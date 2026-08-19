'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AccountSidebar } from '@/components/account/AccountSidebar';
import { EmptyState } from '@/components/ui/EmptyState';
import { ORDER_STATUS_MAP } from '@/lib/constants';
import { Order } from '@/types';
import {
  ClipboardList,
  Search,
  RotateCcw,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  Banknote,
  Building2,
  Loader2,
  ShieldCheck,
  Headphones,
  Award,
  BadgePercent,
  Package,
} from 'lucide-react';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await fetch('/api/orders');
        if (res.ok) {
          const data = await res.json();
          setOrders(data.orders || []);
        }
      } catch (e) {
        console.error('Failed to load orders:', e);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const resetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setDateFrom('');
    setDateTo('');
  };

  // KPI calculations
  const totalCount = orders.length;
  const confirmedCount = orders.filter((o) => o.status === 'confirmed').length;
  const preparingCount = orders.filter((o) => o.status === 'preparing' || o.status === 'pending').length;
  const shippingCount = orders.filter((o) => o.status === 'out_for_delivery').length;
  const deliveredCount = orders.filter((o) => o.status === 'delivered').length;
  const cancelledCount = orders.filter((o) => o.status === 'cancelled').length;

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (search) {
        const query = search.toLowerCase();
        const matchNumber = order.orderNumber.toLowerCase().includes(query);
        const matchItem = order.items?.some((i) => i.productName.toLowerCase().includes(query));
        if (!matchNumber && !matchItem) return false;
      }

      if (statusFilter !== 'all') {
        if (statusFilter === 'preparing' && order.status === 'pending') {
          // treat pending under preparing filter if selected
        } else if (order.status !== statusFilter) {
          return false;
        }
      }

      if (dateFrom) {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        if (orderDate < dateFrom) return false;
      }

      if (dateTo) {
        const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
        if (orderDate > dateTo) return false;
      }

      return true;
    });
  }, [orders, search, statusFilter, dateFrom, dateTo]);

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full text-right">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
          <Link href="/" className="hover:text-amber-400 transition-colors">
            الرئيسية
          </Link>
          <span>&gt;</span>
          <span className="text-zinc-200 font-bold">طلباتي</span>
        </div>

        {/* 2-Column Account Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Dashboard Area */}
          <div className="lg:col-span-9 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-zinc-800/80">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <ClipboardList className="w-6 h-6 text-amber-400" />
                  <h1 className="text-2xl sm:text-3xl font-black text-zinc-100">طلباتي</h1>
                </div>
                <p className="text-xs sm:text-sm text-zinc-400">
                  يمكنك هنا متابعة جميع طلباتك ومعرفة حالتها وتفاصيلها.
                </p>
              </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="p-4 rounded-2xl bg-zinc-900/80 border border-zinc-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
              {/* Search */}
              <div className="lg:col-span-4 relative">
                <input
                  type="text"
                  placeholder="ابحث برقم الطلب أو المنتج..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              </div>

              {/* Status Select */}
              <div className="lg:col-span-3">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  aria-label="تصفية حسب الحالة"
                  className="w-full py-2 px-3 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="pending">طلب جديد</option>
                  <option value="confirmed">تم التأكيد</option>
                  <option value="preparing">قيد التحضير</option>
                  <option value="out_for_delivery">خرج للتوصيل</option>
                  <option value="delivered">تم التوصيل</option>
                  <option value="cancelled">ملغاة</option>
                </select>
              </div>

              {/* Date Pickers */}
              <div className="lg:col-span-3 flex items-center gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-1/2 py-2 px-2 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 focus:outline-none focus:border-amber-400"
                  title="من تاريخ"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-1/2 py-2 px-2 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] text-zinc-300 focus:outline-none focus:border-amber-400"
                  title="إلى تاريخ"
                />
              </div>

              {/* Reset Button */}
              <div className="lg:col-span-2 flex justify-end">
                <button
                  onClick={resetFilters}
                  className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-bold transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>إعادة تعيين</span>
                </button>
              </div>
            </div>

            {/* 6 KPI Cards Row */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* Total */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-amber-400/30 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-bold">
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>إجمالي الطلبات</span>
                </div>
                <div className="text-xl font-black text-amber-400 font-mono">{totalCount}</div>
              </div>

              {/* Confirmed */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-purple-500/20 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-purple-400 text-xs font-bold">
                  <span>تم التأكيد</span>
                </div>
                <div className="text-xl font-black text-purple-400 font-mono">{confirmedCount}</div>
              </div>

              {/* Preparing */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-amber-500/20 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-yellow-400 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>قيد التحضير</span>
                </div>
                <div className="text-xl font-black text-yellow-400 font-mono">{preparingCount}</div>
              </div>

              {/* Out for Delivery */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-blue-500/20 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-blue-400 text-xs font-bold">
                  <Truck className="w-3.5 h-3.5" />
                  <span>خرج للتوصيل</span>
                </div>
                <div className="text-xl font-black text-blue-400 font-mono">{shippingCount}</div>
              </div>

              {/* Delivered */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-emerald-500/20 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>تم التوصيل</span>
                </div>
                <div className="text-xl font-black text-emerald-400 font-mono">{deliveredCount}</div>
              </div>

              {/* Cancelled */}
              <div className="p-3.5 rounded-2xl bg-zinc-900/90 border border-red-500/20 text-center space-y-1">
                <div className="flex items-center justify-center gap-1.5 text-red-400 text-xs font-bold">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>ملغاة</span>
                </div>
                <div className="text-xl font-black text-red-400 font-mono">{cancelledCount}</div>
              </div>
            </div>

            {/* Orders Table */}
            <div className="rounded-3xl bg-zinc-900/90 border border-zinc-800/80 overflow-hidden shadow-2xl">
              <div className="p-5 border-b border-zinc-800/80 flex items-center justify-between">
                <span className="text-xs text-zinc-400">النتائج المعروضة: {filteredOrders.length}</span>
                <h3 className="text-base font-black text-zinc-100">قائمة الطلبات</h3>
              </div>

              {loading ? (
                <div className="py-24 flex flex-col items-center justify-center text-amber-400">
                  <Loader2 className="w-8 h-8 animate-spin mb-3" />
                  <span className="text-xs text-zinc-400">جاري تحميل سجل الطلبيات...</span>
                </div>
              ) : filteredOrders.length === 0 ? (
                <div className="p-12 text-center">
                  <EmptyState
                    title="لا توجد طلبيات حالياً."
                    description="لم تقم بتسجيل أي طلبية بعد، أو لا توجد نتائج مطابقة لخيارات البحث المحددة."
                    actionText="تصفح الكتالوج وبدء الطلب"
                    actionHref="/catalog"
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400">
                        <th className="p-4 font-bold">رقم الطلب</th>
                        <th className="p-4 font-bold">التاريخ</th>
                        <th className="p-4 font-bold text-left">الإجمالي</th>
                        <th className="p-4 font-bold text-center">الحالة</th>
                        <th className="p-4 font-bold">طريقة الدفع</th>
                        <th className="p-4 font-bold text-center">المنتجات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {filteredOrders.map((order) => {
                        const statusInfo = ORDER_STATUS_MAP[order.status] || {
                          label: order.status,
                          color: 'bg-zinc-800 text-zinc-300',
                        };

                        const totalPieces = order.items?.reduce(
                          (sum, item) => sum + item.cartonsCount,
                          0
                        );

                        return (
                          <tr key={order.id} className="text-zinc-200 hover:bg-zinc-800/40 transition-colors">
                            {/* Order Number & View Details */}
                            <td className="p-4">
                              <span className="font-mono font-bold text-amber-400 block text-sm">
                                {order.orderNumber}
                              </span>
                              <Link
                                href={`/orders/${order.id}`}
                                className="inline-flex items-center gap-1 text-[11px] text-zinc-400 hover:text-amber-400 mt-1 transition-colors"
                              >
                                <span>عرض التفاصيل</span>
                                <ChevronLeft className="w-3 h-3" />
                              </Link>
                            </td>

                            {/* Date */}
                            <td className="p-4">
                              <span className="text-zinc-200 block">
                                {new Date(order.createdAt).toLocaleDateString('ar-DZ', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-mono">
                                {new Date(order.createdAt).toLocaleTimeString('ar-DZ', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </td>

                            {/* Total */}
                            <td className="p-4 text-left">
                              <span className="font-mono font-bold text-amber-400 text-sm block">
                                {order.totalAmount.toLocaleString()} دج
                              </span>
                              <span className="text-[10px] text-zinc-500">{totalPieces} كرتون</span>
                            </td>

                            {/* Status */}
                            <td className="p-4 text-center">
                              <span
                                className={`px-3 py-1 rounded-full text-[11px] font-bold border ${statusInfo.color}`}
                              >
                                {statusInfo.label}
                              </span>
                            </td>

                            {/* Payment */}
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                {order.paymentMethod === 'bank_transfer' ? (
                                  <>
                                    <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                                    <div>
                                      <span className="text-xs font-bold block text-zinc-200">تحويل بنكي</span>
                                      <span className="text-[10px] text-zinc-400">حساب CCP/بنكي</span>
                                    </div>
                                  </>
                                ) : (
                                  <>
                                    <Banknote className="w-4 h-4 text-amber-400 shrink-0" />
                                    <div>
                                      <span className="text-xs font-bold block text-zinc-200">عند الاستلام</span>
                                      <span className="text-[10px] text-zinc-400">يداً بيد للسائق</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </td>

                            {/* Products Thumbnails Stack */}
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center -space-x-2 space-x-reverse">
                                {order.items?.slice(0, 3).map((item, idx) => (
                                  <div
                                    key={idx}
                                    className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[9px] font-bold text-amber-400 shadow-sm"
                                    title={item.productName}
                                  >
                                    {item.productName.slice(0, 2)}
                                  </div>
                                ))}
                                {order.items && order.items.length > 3 && (
                                  <div className="w-8 h-8 rounded-lg bg-zinc-950 border border-amber-400/40 flex items-center justify-center text-[10px] font-bold text-zinc-300">
                                    +{order.items.length - 3}
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Account Sidebar */}
          <div className="lg:col-span-3">
            <AccountSidebar />
          </div>
        </div>

        {/* 5 Bottom Trust Badges Bar */}
        <div className="mt-16 pt-10 border-t border-zinc-800/80 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto">
              <Package className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-zinc-100">تغليف آمن</h4>
            <p className="text-[10px] text-zinc-400">تغليف قوي يحافظ على جودة المنتجات</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto">
              <BadgePercent className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-zinc-100">أسعار تنافسية</h4>
            <p className="text-[10px] text-zinc-400">أفضل الأسعار المباشرة في السوق</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto">
              <Award className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-zinc-100">منتجات أصلية 100%</h4>
            <p className="text-[10px] text-zinc-400">جودة مضمونة من المصنع مباشرة</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto">
              <Truck className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-zinc-100">توصيل سريع</h4>
            <p className="text-[10px] text-zinc-400">في جميع أنحاء الجزائر 24-48 ساعة</p>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-center space-y-2 col-span-2 sm:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto">
              <Headphones className="w-5 h-5" />
            </div>
            <h4 className="text-xs font-bold text-zinc-100">دعم العملاء</h4>
            <p className="text-[10px] text-zinc-400">فريق الدعم جاهز لخدمتكم 7/7</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
