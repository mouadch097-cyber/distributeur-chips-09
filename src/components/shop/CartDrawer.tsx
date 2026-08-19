'use client';

import React from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowLeft } from 'lucide-react';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/Button';

export const CartDrawer: React.FC = () => {
  const {
    items,
    removeFromCart,
    updateQuantity,
    totalCartons,
    totalAmount,
    isCartOpen,
    setIsCartOpen,
  } = useCart();

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      <div className="fixed inset-y-0 left-0 max-w-full flex pl-0 sm:pl-10">
        <div className="w-screen max-w-md bg-zinc-950 border-r border-zinc-800 shadow-2xl flex flex-col text-right">
          {/* Header */}
          <div className="p-5 border-b border-zinc-800 flex items-center justify-between">
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-zinc-100">سلة المشتريات</span>
              <ShoppingBag className="w-5 h-5 text-amber-400" />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h4 className="text-base font-bold text-zinc-300 mb-1">السلة فارغة حالياً</h4>
                <p className="text-xs text-zinc-500 mb-6">لم تقم بإضافة أي منتج أو كرتون بعد.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsCartOpen(false)}
                >
                  تصفح المنتجات
                </Button>
              </div>
            ) : (
              items.map(({ product, cartonsCount, flavor, flavorId }) => {
                const itemTotal = product.cartonPrice * cartonsCount;
                const effectiveFlavor = flavor || product.flavor;
                const effectiveFlavorId = flavorId || effectiveFlavor?.id || null;
                const itemKey = `${product.id}_${effectiveFlavorId || 'none'}`;

                return (
                  <div
                    key={itemKey}
                    className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800/80 flex flex-col gap-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <button
                        onClick={() => removeFromCart(product.id, effectiveFlavorId)}
                        className="text-zinc-500 hover:text-red-400 p-1 transition-colors"
                        title="حذف من السلة"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex-1 flex items-center justify-end gap-3 text-right">
                        <div>
                          <span className="text-xs text-amber-400 font-semibold block">
                            {product.brand?.name || 'شيبس'}
                          </span>
                          <h4 className="text-sm font-bold text-zinc-100">{product.arabicName}</h4>
                          {effectiveFlavor && (
                            <span className="inline-block text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-amber-300 font-bold mt-0.5">
                              {effectiveFlavor.arabicName}
                            </span>
                          )}
                          <p className="text-xs text-zinc-400 mt-0.5">
                            كرتون يحتوي على {product.cartonQuantity} باكي
                          </p>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center overflow-hidden shrink-0">
                          {product.imageUrl ? (
                            <img
                              src={product.imageUrl}
                              alt={product.arabicName}
                              className="w-full h-full object-contain p-0.5"
                            />
                          ) : (
                            <span className="text-[8px] font-bold text-amber-400">CHIPS</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-zinc-800/60">
                      {/* Quantity Stepper */}
                      <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(product.id, cartonsCount + 1, effectiveFlavorId)}
                          className="w-7 h-7 flex items-center justify-center rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-200"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-zinc-100 min-w-[28px] text-center font-mono">
                          {cartonsCount}
                        </span>
                        <button
                          onClick={() => updateQuantity(product.id, cartonsCount - 1, effectiveFlavorId)}
                          className="w-7 h-7 flex items-center justify-center rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-200"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Price */}
                      <div className="text-left">
                        <span className="text-sm font-bold text-amber-400 font-mono">
                          {itemTotal.toLocaleString()} دج
                        </span>
                        <span className="text-[11px] text-zinc-500 block font-mono">
                          ({product.cartonPrice.toLocaleString()} دج / كرتون)
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Summary & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-zinc-800 bg-zinc-950 space-y-4">
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-zinc-400">
                  <span>إجمالي عدد الكراتين:</span>
                  <span className="font-bold text-zinc-200 font-mono">{totalCartons} كرتون</span>
                </div>
                <div className="flex justify-between text-base font-bold text-zinc-100 pt-2 border-t border-zinc-900">
                  <span>المجموع الإجمالي:</span>
                  <span className="text-amber-400 font-mono text-lg">{totalAmount.toLocaleString()} دج</span>
                </div>
              </div>

              <Link href="/checkout" onClick={() => setIsCartOpen(false)} className="block w-full">
                <Button variant="primary" size="lg" className="w-full flex items-center justify-center gap-2">
                  <span>متابعة إتمام الطلب</span>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
