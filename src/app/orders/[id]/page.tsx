'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { TrackingTimeline } from '@/components/shop/TrackingTimeline';
import { Button } from '@/components/ui/Button';
import { Order } from '@/types';
import { ORDER_STATUS_MAP, BUSINESS_INFO } from '@/lib/constants';
import {
  Package,
  FileText,
  Truck,
  MapPin,
  Phone,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
} from 'lucide-react';

export default function OrderDetailsPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = params?.id as string;
  const isNewSuccess = searchParams.get('success') === 'true';

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOrder() {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'تعذر تحميل بيانات الطلبية');
        }
        const data = await res.json();
        setOrder(data.order);
      } catch (err: any) {
        setError(err.message || 'حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    }
    if (orderId) loadOrder();
  }, [orderId]);

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full text-right">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
          <Link href="/" className="hover:text-amber-400">الرئيسية</Link>
          <span>/</span>
          <Link href="/orders" className="hover:text-amber-400">طلبياتي</Link>
          <span>/</span>
          <span className="text-zinc-200 font-bold font-mono">{order?.orderNumber || 'تفاصيل الطلبية'}</span>
        </div>

        {/* Success Alert if just placed */}
        {isNewSuccess && (
          <div className="mb-8 p-6 rounded-2xl bg-emerald-950/40 border border-emerald-800 text-emerald-200 flex items-start gap-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-lg font-black text-emerald-300">تم تسجيل طلبيتكم بنجاح!</h2>
              <p className="text-xs text-emerald-200/80 mt-1 leading-relaxed">
                شكراً لتعاملكم مع Distributeur Chips 09. سيقوم فريق المبيعات بمراجعة وتأكيد الطلبية وتجهيز الشاحنة للتوصيل.
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-amber-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <span className="text-xs text-zinc-400">جاري تحميل تفاصيل الطلبية...</span>
          </div>
        ) : error || !order ? (
          <div className="p-8 rounded-2xl bg-red-950/30 border border-red-800 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-red-200 mb-2">{error || 'الطلبية غير موجودة'}</h3>
            <Link href="/orders">
              <Button variant="outline" size="sm">
                العودة لقائمة الطلبيات
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Header with status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-400">رقم الطلبية:</span>
                  <span className="text-xl font-black text-amber-400 font-mono">
                    {order.orderNumber}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  تاريخ الإنشاء:{' '}
                  {new Date(order.createdAt).toLocaleDateString('ar-DZ', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {order.invoice && (
                  <Link href={`/invoices/${order.invoice.id}`}>
                    <Button variant="outline" size="sm" className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-amber-400" />
                      <span>عرض الفاتورة</span>
                    </Button>
                  </Link>
                )}
                <a
                  href={`https://wa.me/213541655938?text=${encodeURIComponent(
                    `مرحباً، أستفسر عن طلبيتي رقم ${order.orderNumber}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-600/30"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>استفسار واتساب</span>
                </a>
              </div>
            </div>

            {/* Tracking Timeline */}
            <TrackingTimeline
              status={order.status}
              createdAt={order.createdAt}
              updatedAt={order.updatedAt}
            />

            {/* Items & Delivery Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Order Items Table */}
              <div className="lg:col-span-8 rounded-2xl bg-zinc-900/90 border border-zinc-800 p-6 space-y-4">
                <h3 className="text-base font-black text-zinc-100 pb-3 border-b border-zinc-800">
                  الأصناف المطلوبة
                </h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-right text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-400">
                        <th className="pb-3 font-bold">المنتج</th>
                        <th className="pb-3 font-bold text-center">الكراتين</th>
                        <th className="pb-3 font-bold text-left">سعر الكرتون</th>
                        <th className="pb-3 font-bold text-left">المجموع</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {order.items?.map((item) => (
                        <tr key={item.id} className="text-zinc-200">
                          <td className="py-3">
                            <span className="font-bold text-zinc-100 block">{item.productName}</span>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[11px] text-zinc-400">
                                {item.brandName} • كرتون {item.cartonQuantity} قطعة
                              </span>
                              {item.flavorName && (
                                <span className="text-[10px] text-amber-300 font-bold px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700/60">
                                  {item.flavorName}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 text-center font-mono font-bold">
                            {item.cartonsCount}
                          </td>
                          <td className="py-3 text-left font-mono">
                            {item.cartonPrice.toLocaleString()} دج
                          </td>
                          <td className="py-3 text-left font-mono font-bold text-amber-400">
                            {item.totalPrice.toLocaleString()} دج
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex justify-between items-center text-sm font-bold">
                  <span className="text-zinc-300">المجموع الكلي للطلبية:</span>
                  <span className="text-xl font-black text-amber-400 font-mono">
                    {order.totalAmount.toLocaleString()} دج
                  </span>
                </div>
              </div>

              {/* Delivery Details Card */}
              <div className="lg:col-span-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 p-6 space-y-4">
                <h3 className="text-base font-black text-zinc-100 pb-3 border-b border-zinc-800 flex items-center gap-2">
                  <Truck className="w-4 h-4 text-amber-400" />
                  <span>تفاصيل التوصيل</span>
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-zinc-500 block">المستلم:</span>
                    <span className="font-bold text-zinc-200">{order.customerName}</span>
                  </div>

                  <div>
                    <span className="text-zinc-500 block">رقم الهاتف:</span>
                    <span className="font-mono text-zinc-200">{order.phone}</span>
                  </div>

                  <div>
                    <span className="text-zinc-500 block">الولاية:</span>
                    <span className="text-zinc-200">{order.wilaya}</span>
                  </div>

                  <div>
                    <span className="text-zinc-500 block">العنوان:</span>
                    <span className="text-zinc-200">{order.address}</span>
                  </div>

                  {order.notes && (
                    <div>
                      <span className="text-zinc-500 block">ملاحظات:</span>
                      <span className="text-zinc-300 italic">{order.notes}</span>
                    </div>
                  )}

                  {order.driver && (
                    <div className="pt-3 border-t border-zinc-800">
                      <span className="text-amber-400 font-bold block mb-1">السائق المكلف:</span>
                      <span className="text-zinc-200">{order.driver.name} ({order.driver.phone})</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
