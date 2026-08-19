'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { AdminHeader } from '@/components/layout/AdminHeader';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { ORDER_STATUS_MAP } from '@/lib/constants';
import { Order, Driver } from '@/types';
import { Loader2, Eye, Truck, CheckCircle2, User, Phone, MapPin, Search } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Details Modal
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  const loadOrders = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/orders?status=${statusFilter}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setDrivers(data.drivers || []);
      }
    } catch (e) {
      console.error('Error fetching admin orders:', e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });
      if (res.ok) {
        loadOrders();
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus as any } : null));
        }
      }
    } catch (e) {
      console.error('Failed to update status', e);
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignDriver = async (orderId: string, driverId: string) => {
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, driverId }),
      });
      if (res.ok) {
        loadOrders();
      }
    } catch (e) {
      console.error('Failed to assign driver', e);
    } finally {
      setUpdating(false);
    }
  };

  const filteredOrders = orders.filter(
    (o) =>
      o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
      o.customerName.includes(search) ||
      o.wilaya.includes(search) ||
      o.phone.includes(search)
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#08080a] text-right">
      <AdminHeader
        title="إدارة ومعالجة الطلبيات"
        subtitle="متابعة طلبيات الجملة وتغيير الحالات وتكليف شاحنات وسائقي التوزيع"
      />

      <main className="p-4 sm:p-6 lg:p-8 space-y-6 flex-1">
        {/* Controls */}
        <div className="flex flex-col gap-3 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative w-full sm:w-64">
              <input
                type="text"
                placeholder="بحث برقم الطلبية أو العميل..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-xs text-zinc-200 focus:outline-none focus:border-amber-400"
            >
              <option value="all">جميع الحالات</option>
              <option value="pending">طلب جديد (Pending)</option>
              <option value="confirmed">تم التأكيد (Confirmed)</option>
              <option value="preparing">قيد التحضير (Preparing)</option>
              <option value="out_for_delivery">خرج للتوصيل (Out for Delivery)</option>
              <option value="delivered">تم التسليم (Delivered)</option>
              <option value="cancelled">ملغي (Cancelled)</option>
            </select>
          </div>

          <span className="text-xs text-zinc-400">إجمالي الطلبيات: {filteredOrders.length}</span>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-amber-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <span className="text-xs text-zinc-400">جاري تحميل الطلبيات...</span>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="p-12 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-center text-zinc-400">
            لا توجد طلبيات حالياً.
          </div>
        ) : (
          <div className="rounded-2xl bg-zinc-900/90 border border-zinc-800 overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-zinc-950/80 border-b border-zinc-800 text-zinc-400">
                    <th className="p-4 font-bold">رقم الطلبية</th>
                    <th className="p-4 font-bold">العميل / المتجر</th>
                    <th className="p-4 font-bold">الولاية</th>
                    <th className="p-4 font-bold text-left">المبلغ</th>
                    <th className="p-4 font-bold text-center">حالة الطلبية</th>
                    <th className="p-4 font-bold">السائق المكلف</th>
                    <th className="p-4 font-bold text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredOrders.map((order) => {
                    const statusInfo = ORDER_STATUS_MAP[order.status] || {
                      label: order.status,
                      color: 'bg-zinc-800 text-zinc-300',
                    };

                    return (
                      <tr key={order.id} className="text-zinc-200 hover:bg-zinc-800/40">
                        <td className="p-4 font-mono font-bold text-amber-400">
                          {order.orderNumber}
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-zinc-100 block">{order.customerName}</span>
                          <span className="text-[11px] text-zinc-500 font-mono">{order.phone}</span>
                        </td>
                        <td className="p-4 text-zinc-300">{order.wilaya}</td>
                        <td className="p-4 text-left font-mono font-bold text-zinc-100">
                          {order.totalAmount.toLocaleString()} دج
                        </td>
                        <td className="p-4 text-center">
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                            disabled={updating}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${statusInfo.color} bg-zinc-900 focus:outline-none cursor-pointer`}
                          >
                            <option value="pending">طلب جديد</option>
                            <option value="confirmed">تم التأكيد</option>
                            <option value="preparing">قيد التحضير</option>
                            <option value="out_for_delivery">خرج للتوصيل</option>
                            <option value="delivered">تم التسليم</option>
                            <option value="cancelled">ملغي</option>
                          </select>
                        </td>
                        <td className="p-4">
                          <select
                            value={order.driverId || ''}
                            onChange={(e) => handleAssignDriver(order.id, e.target.value)}
                            className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-200 focus:outline-none"
                          >
                            <option value="">بدون تعيين سائق</option>
                            {drivers.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name} ({d.phone})
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4 text-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedOrder(order)}
                            className="flex items-center gap-1 mx-auto"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>تفاصيل</span>
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Order Details Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`تفاصيل الطلبية: ${selectedOrder?.orderNumber || ''}`}
        maxWidth="lg"
      >
        {selectedOrder && (
          <div className="space-y-6 text-xs text-right">
            {/* Customer & Location */}
            <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-zinc-950 border border-zinc-800">
              <div>
                <span className="text-zinc-500 block">الاسم:</span>
                <span className="font-bold text-zinc-100 text-sm">{selectedOrder.customerName}</span>
                {selectedOrder.user?.companyName && (
                  <span className="text-zinc-400 block mt-0.5">
                    المحل: {selectedOrder.user.companyName}
                  </span>
                )}
              </div>
              <div>
                <span className="text-zinc-500 block">الهاتف:</span>
                <span className="font-mono text-zinc-100 font-bold">{selectedOrder.phone}</span>
                <span className="text-zinc-400 block mt-0.5">الولاية: {selectedOrder.wilaya}</span>
              </div>
              <div className="col-span-2">
                <span className="text-zinc-500 block">العنوان:</span>
                <span className="text-zinc-200">{selectedOrder.address}</span>
              </div>
              {selectedOrder.notes && (
                <div className="col-span-2">
                  <span className="text-zinc-500 block">ملاحظات العميل:</span>
                  <span className="text-zinc-300 italic">{selectedOrder.notes}</span>
                </div>
              )}
            </div>

            {/* Items */}
            <div>
              <h4 className="font-bold text-zinc-200 mb-2">الأصناف والكراتين:</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500">
                      <th className="pb-2">المنتج</th>
                      <th className="pb-2 text-center">الكراتين</th>
                      <th className="pb-2 text-left">سعر الكرتون</th>
                      <th className="pb-2 text-left">المجموع</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {selectedOrder.items?.map((item) => (
                      <tr key={item.id} className="text-zinc-300">
                        <td className="py-2.5">
                          <span className="font-bold text-zinc-100 block">{item.productName}</span>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] text-zinc-500">{item.brandName}</span>
                            {item.flavorName && (
                              <span className="text-[10px] text-amber-300 font-bold px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700/60">
                                {item.flavorName}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 text-center font-mono font-bold">{item.cartonsCount}</td>
                        <td className="py-2.5 text-left font-mono">{item.cartonPrice.toLocaleString()} دج</td>
                        <td className="py-2.5 text-left font-mono font-bold text-amber-400">
                          {item.totalPrice.toLocaleString()} دج
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="pt-3 border-t border-zinc-800 flex justify-between items-center text-sm font-bold">
              <span className="text-zinc-300">المبلغ الإجمالي:</span>
              <span className="text-amber-400 font-mono text-lg">
                {selectedOrder.totalAmount.toLocaleString()} دج
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
