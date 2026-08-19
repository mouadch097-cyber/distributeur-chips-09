'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCart } from '@/lib/cart-context';
import { useAuth } from '@/lib/auth-context';
import { Trash2, Plus, Minus, ArrowLeft, ArrowRight, ShieldCheck, Lock } from 'lucide-react';

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, clearCart, totalCartons, totalAmount } = useCart();
  const { user } = useAuth();
  const isApproved = user?.role === 'admin' || user?.verificationStatus === 'APPROVED';

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full text-right">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
          <Link href="/" className="hover:text-amber-400">الرئيسية</Link>
          <span>/</span>
          <span className="text-zinc-200 font-bold">سلة المشتريات</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-zinc-100 mb-8">
          سلة <span className="text-amber-400">الطلبيات والجملة</span>
        </h1>

        {items.length === 0 ? (
          <EmptyState
            title="سلة المشتريات فارغة حالياً."
            description="لم تقم بإضافة أي كرتون شيبس إلى سلتك بعد. تصفح الكتالوج لاختيار المنتجات المطلوبة."
            actionText="تصفح كتالوج الشيبس"
            actionHref="/catalog"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl bg-zinc-900/60 border border-zinc-800 text-xs text-zinc-400">
                <span>عدد المنتجات المحددة: {items.length}</span>
                <button
                  onClick={clearCart}
                  className="text-red-400 hover:text-red-300 font-medium transition-colors min-h-[44px] px-2"
                >
                  تفريغ السلة بالكامل
                </button>
              </div>

              {items.map(({ product, cartonsCount, flavor, flavorId }) => {
                const itemTotal = product.cartonPrice * cartonsCount;
                const effectiveFlavor = flavor || product.flavor;
                const effectiveFlavorId = flavorId || effectiveFlavor?.id || null;
                const itemKey = `${product.id}_${effectiveFlavorId || 'none'}`;

                return (
                  <div
                    key={itemKey}
                    className="p-4 sm:p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.arabicName}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <span className="text-[9px] font-bold text-amber-400">CHIPS 09</span>
                        )}
                      </div>

                      <div className="min-w-0">
                        <span className="text-xs font-bold text-amber-400 block">
                          {product.brand?.name}
                        </span>
                        <h3 className="text-base font-bold text-zinc-100 mt-0.5 truncate">
                          {product.arabicName}
                        </h3>
                        {effectiveFlavor && (
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[11px] text-zinc-400">النكهة:</span>
                            <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-amber-300 font-bold">
                              {effectiveFlavor.arabicName}
                            </span>
                          </div>
                        )}
                        <p className="text-xs text-zinc-400 mt-1">
                          كرتون {product.cartonQuantity} باكي • {product.cartonPrice.toLocaleString()} دج للكرتون
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 sm:gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                      {/* Quantity Stepper */}
                      <div className="flex items-center bg-zinc-950 border border-zinc-800 rounded-xl p-1">
                        <button
                          onClick={() => updateQuantity(product.id, cartonsCount + 1, effectiveFlavorId)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:w-8 sm:h-8"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center font-bold text-sm font-mono text-zinc-100">
                          {cartonsCount}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, cartonsCount - 1, effectiveFlavorId)}
                          className="w-9 h-9 flex items-center justify-center rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-200 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:w-8 sm:h-8"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Total for item */}
                      <div className="text-left min-w-[90px]">
                        <span className="text-base font-black text-amber-400 font-mono block">
                          {itemTotal.toLocaleString()} دج
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          ({cartonsCount} كرتون)
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromCart(product.id, effectiveFlavorId)}
                        className="p-2 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                        title="حذف المنتج"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}

              <div className="pt-2">
                <Link
                  href="/catalog"
                  className="inline-flex items-center gap-2 text-xs font-bold text-amber-400 hover:text-amber-300 min-h-[44px]"
                >
                  <ArrowRight className="w-4 h-4" />
                  <span>متابعة التسوق وإضافة منتجات أخرى</span>
                </Link>
              </div>
            </div>

            {/* Summary Box */}
            <div className="lg:col-span-4 rounded-2xl bg-zinc-900/90 border border-zinc-800 p-6 space-y-6 lg:sticky lg:top-24">
              <h3 className="text-lg font-black text-zinc-100 pb-3 border-b border-zinc-800">
                ملخص الطلبية
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>إجمالي الكراتين:</span>
                  <span className="font-bold text-zinc-100 font-mono">{totalCartons} كرتون</span>
                </div>

                <div className="flex justify-between text-zinc-400">
                  <span>نوع الدفع:</span>
                  <span className="text-zinc-200">الدفع عند الاستلام (COD)</span>
                </div>

                <div className="pt-4 border-t border-zinc-800 flex justify-between items-center text-base font-bold text-zinc-100">
                  <span>المبلغ الإجمالي:</span>
                  <span className="text-2xl font-black text-amber-400 font-mono">
                    {totalAmount.toLocaleString()} دج
                  </span>
                </div>
              </div>

              {!user ? (
                <Link href="/login?redirect=/cart" className="block w-full">
                  <button className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 min-h-[44px]">
                    <span>تسجيل الدخول للمتابعة</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </Link>
              ) : !isApproved ? (
                <Link href="/verification" className="block w-full">
                  <button className="w-full py-3.5 px-4 rounded-xl bg-amber-400/10 hover:bg-amber-400 text-amber-400 hover:text-zinc-950 border border-amber-400/40 font-black text-sm flex items-center justify-center gap-2 transition-all min-h-[44px]">
                    <ShieldCheck className="w-4 h-4" />
                    <span>توثيق السجل التجاري لتأكيد الطلب</span>
                  </button>
                </Link>
              ) : (
                <Link href="/checkout" className="block w-full">
                  <button className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 min-h-[44px]">
                    <span>متابعة إتمام الطلب</span>
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                </Link>
              )}

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800/80 flex items-center gap-3 text-xs text-zinc-400">
                <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                <span>حساب الأسعار والكميات يتم التحقق منه مباشرة من الخادم</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
