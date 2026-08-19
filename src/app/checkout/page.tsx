'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { WILAYAS } from '@/lib/constants';
import { ShieldCheck, Truck, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, totalCartons, totalAmount, clearCart } = useCart();
  const { user, isLoading: authLoading } = useAuth();

  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    wilaya: WILAYAS[0].name,
    address: '',
    notes: '',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        customerName: prev.customerName || user.name || '',
        phone: prev.phone || user.phone || '',
        wilaya: prev.wilaya || user.wilaya || WILAYAS[0].name,
        address: prev.address || user.address || '',
      }));
    }
  }, [user]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-amber-400">
        جاري التحقق من الجلسة...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between">
        <Navbar />
        <div className="w-full max-w-md mx-auto my-auto p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center mx-4 sm:mx-auto">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-zinc-100 mb-2">تسجيل الدخول مطلوب</h2>
          <p className="text-xs text-zinc-400 mb-6">
            يجب تسجيل الدخول أو إنشاء حساب تاجر للمتابعة إلى إتمام طلبية الجملة.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/login?redirect=/checkout" className="flex-1">
              <Button variant="primary" size="md" className="w-full min-h-[44px]">
                تسجيل الدخول
              </Button>
            </Link>
            <Link href="/register" className="flex-1">
              <Button variant="secondary" size="md" className="w-full min-h-[44px]">
                حساب جديد
              </Button>
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (user.role !== 'admin' && user.verificationStatus !== 'APPROVED') {
    return (
      <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between">
        <Navbar />
        <div className="w-full max-w-md mx-auto my-auto p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center space-y-4 px-4 sm:px-8">
          <ShieldCheck className="w-12 h-12 text-amber-400 mx-auto" />
          <h2 className="text-xl font-bold text-zinc-100">توثيق النشاط التجاري مطلوب</h2>
          <p className="text-xs text-zinc-400 leading-relaxed">
            {user.verificationStatus === 'REJECTED'
              ? `تم رفض طلب التوثيق السابق (${user.rejectionReason || 'الوثائق غير واضحة'}). يرجى إعادة تقديم وثائق صالحة.`
              : 'حسابك التجاري قيد المراجعة. ستتم مراجعة وتدقيق السجل التجاري خلال 24 ساعة لتفعيل إرسال الطلبيات مباشرة.'}
          </p>
          <Link href="/verification">
            <Button variant="primary" size="md" className="w-full flex items-center justify-center gap-2 min-h-[44px]">
              <ShieldCheck className="w-4 h-4" />
              <span>{user.verificationStatus === 'REJECTED' ? 'إعادة تقديم الوثائق' : 'متابعة حالة التوثيق'}</span>
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between">
        <Navbar />
        <div className="w-full max-w-md mx-auto my-auto p-6 sm:p-8 rounded-3xl bg-zinc-900 border border-zinc-800 text-center px-4 sm:px-8">
          <h2 className="text-xl font-bold text-zinc-100 mb-2">السلة فارغة</h2>
          <p className="text-xs text-zinc-400 mb-6">
            يرجى إضافة كراتين شيبس إلى سلتك قبل التوجه لإتمام الطلب.
          </p>
          <Link href="/catalog">
            <Button variant="primary" size="md" className="min-h-[44px]">
              تصفح الكتالوج
            </Button>
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const orderPayload = {
        customerName: formData.customerName,
        phone: formData.phone,
        wilaya: formData.wilaya,
        address: formData.address,
        notes: formData.notes,
        items: items.map((item) => ({
          productId: item.product.id,
          flavorId: item.flavorId || item.flavor?.id || null,
          productFlavorId: item.productFlavorId || null,
          cartonsCount: item.cartonsCount,
        })),
      };

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء إتمام الطلب');
      }

      clearCart();
      router.push(`/orders/${data.orderId}?success=true`);
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الاتصال بالخادم');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full text-right">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
          <Link href="/" className="hover:text-amber-400">الرئيسية</Link>
          <span>/</span>
          <Link href="/cart" className="hover:text-amber-400">السلة</Link>
          <span>/</span>
          <span className="text-zinc-200 font-bold">إتمام طلب الجملة</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 mb-8">
          تأكيد <span className="text-amber-400">طلب التوريد والجملة</span>
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Customer & Delivery Details Form */}
          <div className="lg:col-span-7 rounded-3xl bg-zinc-900/80 border border-zinc-800/80 p-6 sm:p-8 space-y-6">
            <h2 className="text-lg font-black text-zinc-100 pb-3 border-b border-zinc-800">
              معلومات التاجر وموقع التوصيل
            </h2>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="الاسم الكامل للتاجر / المستلم *"
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                required
                placeholder="محمد بن علي"
                className="w-full"
              />

              <Input
                type="tel"
                label="رقم الهاتف للتنسيق مع السائق *"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                placeholder="0550 00 00 00"
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="الولاية *"
                value={formData.wilaya}
                onChange={(e) => setFormData({ ...formData, wilaya: e.target.value })}
                required
                className="w-full"
              >
                {WILAYAS.map((w) => (
                  <option key={w.code} value={w.name}>
                    {w.code} - {w.name}
                  </option>
                ))}
              </Select>

              <Input
                label="العنوان الكامل للمحل أو المستودع *"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
                placeholder="حي النور، المحل رقم 12"
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5">
                ملاحظات إضافية حول التوصيل (اختياري)
              </label>
              <textarea
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="أوقات الفتح، توجيهات لمسار السائق، الخ..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400 text-right resize-none"
              />
            </div>

            <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-400 space-y-1">
              <div className="flex items-center gap-2 text-zinc-200 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>طريقة الدفع: الدفع عند الاستلام (COD)</span>
              </div>
              <p>يتم دفع مستحقات الطلبية نقداً عند وصول شاحنة التوزيع واستلام كراتين الشيبس مع الفاتورة المرفقة.</p>
            </div>
          </div>

          {/* Order Summary & Confirm */}
          <div className="lg:col-span-5 rounded-3xl bg-zinc-900/90 border border-zinc-800/80 p-6 sm:p-8 space-y-6 lg:sticky lg:top-24 shadow-xl">
            <h2 className="text-lg font-black text-zinc-100 pb-3 border-b border-zinc-800">
              ملخص الأصناف المطلوبة
            </h2>

            <div className="max-h-60 overflow-y-auto space-y-3 pr-1">
              {items.map(({ product, cartonsCount, flavor, flavorId }) => {
                const effectiveFlavor = flavor || product.flavor;
                const itemKey = `${product.id}_${flavorId || effectiveFlavor?.id || 'none'}`;

                return (
                  <div key={itemKey} className="flex items-center justify-between text-xs py-2 border-b border-zinc-800/50">
                    <div className="text-right">
                      <span className="font-bold text-zinc-200 block">{product.arabicName}</span>
                      {effectiveFlavor && (
                        <span className="inline-block text-[10px] text-amber-300 font-bold">
                          نكهة: {effectiveFlavor.arabicName}
                        </span>
                      )}
                      <span className="text-zinc-500 block">
                        {cartonsCount} كرتون × {product.cartonPrice.toLocaleString()} دج
                      </span>
                    </div>
                    <span className="font-bold font-mono text-amber-400 shrink-0 mr-2">
                      {(product.cartonPrice * cartonsCount).toLocaleString()} دج
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="space-y-2 pt-2 text-xs border-t border-zinc-800">
              <div className="flex justify-between text-zinc-400">
                <span>إجمالي الكراتين:</span>
                <span className="font-bold text-zinc-100 font-mono">{totalCartons} كرتون</span>
              </div>

              <div className="flex justify-between items-center text-sm font-bold text-zinc-100 pt-2 border-t border-zinc-800">
                <span>المبلغ المستحق:</span>
                <span className="text-2xl font-black text-amber-400 font-mono">
                  {totalAmount.toLocaleString()} دج
                </span>
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isSubmitting}
              className="w-full flex items-center justify-center gap-2 min-h-[44px]"
            >
              <span>تأكيد وإرسال الطلبية</span>
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <div className="flex items-center gap-2 text-[11px] text-zinc-500 justify-center">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>معاملات تجارية محمية وفواتير رسمية</span>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
