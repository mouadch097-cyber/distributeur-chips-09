'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingCart, Plus, Minus, Check, Clock, AlertCircle, ShieldCheck } from 'lucide-react';
import { Product, ProductFlavor } from '@/types';
import { useCart } from '@/lib/cart-context';
import { Button } from '@/components/ui/Button';

interface ProductDetailClientProps {
  product: Product & { priceHidden?: boolean; tierLabel?: string };
  availableVariants?: Product[];
}

export const ProductDetailClient: React.FC<ProductDetailClientProps> = ({
  product,
  availableVariants = [],
}) => {
  const { addToCart } = useCart();
  const [selectedFlavorId, setSelectedFlavorId] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [preOrderDone, setPreOrderDone] = useState(false);
  const [stockError, setStockError] = useState('');

  const isPriceHidden = Boolean(product.priceHidden || product.cartonPrice === 0);

  // Extract all available flavor variants for this product
  const availableProductFlavors = useMemo(() => {
    if (product.flavors && product.flavors.length > 0) {
      return product.flavors;
    }

    const list: any[] = [];
    if (product.flavor) {
      list.push({
        id: `pf-${product.id}`,
        productId: product.id,
        flavorId: product.flavor.id,
        flavor: product.flavor,
        stock: product.stock,
        active: product.active,
      });
    }

    for (const v of availableVariants) {
      if (v.flavor && !list.some((item) => item.flavorId === v.flavor?.id)) {
        list.push({
          id: `pf-${v.id}`,
          productId: v.id,
          flavorId: v.flavor.id,
          flavor: v.flavor,
          stock: v.stock,
          active: v.active,
        });
      }
    }
    return list;
  }, [product, availableVariants]);

  // Set initial selected flavor
  useEffect(() => {
    if (availableProductFlavors.length > 0 && !selectedFlavorId) {
      setSelectedFlavorId(availableProductFlavors[0].flavorId);
    }
  }, [availableProductFlavors, selectedFlavorId]);

  // Current selected flavor item
  const currentFlavorItem = useMemo(() => {
    if (availableProductFlavors.length === 0) return null;
    return (
      availableProductFlavors.find((pf) => pf.flavorId === selectedFlavorId) ||
      availableProductFlavors[0]
    );
  }, [availableProductFlavors, selectedFlavorId]);

  const currentStock = currentFlavorItem ? currentFlavorItem.stock : product.stock;
  const isAvailable = currentStock > 0 && product.active;

  const handleFlavorSelect = (flavorId: string) => {
    setSelectedFlavorId(flavorId);
    setQuantity(1);
    setStockError('');
  };

  const handleAdd = () => {
    setStockError('');
    if (!isAvailable) return;

    if (quantity > currentStock) {
      setStockError(`الكمية المطلوبة غير متوفرة. المتوفر حالياً: ${currentStock} كرتون فقط.`);
      return;
    }

    addToCart(
      product,
      quantity,
      currentFlavorItem?.flavor || product.flavor || null,
      currentFlavorItem || null
    );
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handlePreOrder = () => {
    setPreOrderDone(true);
    setTimeout(() => setPreOrderDone(false), 3000);
  };

  return (
    <div className="space-y-5 pt-2">
      {/* Flavor Selection Section */}
      {availableProductFlavors.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-zinc-300">اختر النكهة المطلوبة:</span>
            {currentFlavorItem?.flavor && (
              <span className="text-xs text-amber-400 font-bold">
                المحددة: {currentFlavorItem.flavor.arabicName}
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {availableProductFlavors.map((item) => {
              const f = item.flavor;
              if (!f) return null;
              const isSelected = item.flavorId === selectedFlavorId;
              const inStock = item.stock > 0;

              return (
                <button
                  key={item.id || item.flavorId}
                  type="button"
                  onClick={() => handleFlavorSelect(item.flavorId)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                    isSelected
                      ? 'bg-amber-400 text-zinc-950 border-amber-400 shadow-md shadow-amber-500/10 scale-105'
                      : inStock
                      ? 'bg-zinc-900 text-zinc-300 border-zinc-800 hover:border-zinc-700 hover:text-zinc-100'
                      : 'bg-zinc-900/60 text-zinc-400 border-dashed border-zinc-800 hover:border-amber-400/40'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full border border-black/20"
                    style={{ backgroundColor: f.color || '#eab308' }}
                  />
                  <span>{f.arabicName}</span>
                  <span
                    className={`text-[10px] font-mono ${
                      isSelected
                        ? 'text-zinc-900/90 font-black'
                        : inStock
                        ? 'text-zinc-500'
                        : 'text-amber-400/80'
                    }`}
                  >
                    ({inStock ? `${item.stock} كرتون` : 'طلب مسبق'})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* If price is hidden (unverified merchant) */}
      {isPriceHidden ? (
        <div className="p-5 rounded-2xl bg-amber-400/10 border border-amber-400/30 text-amber-300 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
            <ShieldCheck className="w-5 h-5 shrink-0" />
            <span>الأسعار وإمكانية الطلب مخصصة للتجار المعتمدين</span>
          </div>
          <p className="text-xs text-zinc-300 leading-relaxed">
            لحماية شبكة التوزيع وضمان أفضل الأسعار، يتطلب الموقع توثيق السجل التجاري للاطلاع على قائمة الأسعار الخاصة برتبتك وإرسال طلبيات الشراء.
          </p>
          <Link href="/verification">
            <Button variant="primary" size="md" className="w-full flex items-center justify-center gap-2 font-bold mt-2">
              <ShieldCheck className="w-4 h-4" />
              <span>تقديم طلب توثيق السجل التجاري الآن</span>
            </Button>
          </Link>
        </div>
      ) : (
        <>
          {/* Stock validation error notice */}
          {stockError && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{stockError}</span>
            </div>
          )}

          {/* Cartons Counter & Add to Cart / Pre-Order */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
            {/* Stepper */}
            <div className="flex items-center justify-between sm:justify-start bg-zinc-900 border border-zinc-800 rounded-xl p-1 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setStockError('');
                  setQuantity((q) => (isAvailable ? Math.min(currentStock, q + 1) : q + 1));
                }}
                disabled={isAvailable && quantity >= currentStock}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 disabled:opacity-30 transition-colors"
                title="زيادة الكمية"
              >
                <Plus className="w-4 h-4" />
              </button>
              <div className="px-4 text-center">
                <span className="font-black font-mono text-base text-amber-400 block">
                  {quantity}
                </span>
                <span className="text-[9px] text-zinc-400 block -mt-1 font-sans">كرتونة</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStockError('');
                  setQuantity((q) => Math.max(1, q - 1));
                }}
                disabled={quantity <= 1}
                className="w-10 h-10 flex items-center justify-center rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-100 disabled:opacity-30 transition-colors"
                title="تقليل الكمية"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>

            {/* Action Button */}
            {isAvailable ? (
              <Button
                variant="primary"
                size="lg"
                onClick={handleAdd}
                className="flex-1 flex items-center justify-center gap-2 font-bold shadow-lg shadow-amber-500/10 py-3"
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5 text-emerald-950 stroke-[3]" />
                    <span>تمت إضافة {quantity} كرتون إلى السلة!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>
                      إضافة {quantity} كرتون للسلة (
                      {currentFlavorItem?.flavor?.arabicName || product.arabicName})
                    </span>
                  </>
                )}
              </Button>
            ) : (
              <Button
                variant="outline"
                size="lg"
                onClick={handlePreOrder}
                className="flex-1 flex items-center justify-center gap-2 font-bold bg-amber-400/10 hover:bg-amber-400 text-amber-400 hover:text-zinc-950 border border-amber-400/40 hover:border-amber-400 py-3 transition-all"
              >
                {preOrderDone ? (
                  <>
                    <Check className="w-5 h-5 stroke-[3]" />
                    <span>تم تسجيل اهتمامك بالطلب المسبق! سنعلمك فور توفره</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-5 h-5" />
                    <span>
                      حجز طلب مسبق ({quantity} كرتون —{' '}
                      {currentFlavorItem?.flavor?.arabicName || product.arabicName})
                    </span>
                  </>
                )}
              </Button>
            )}
          </div>

          {/* Dynamic Subtotal & Status indicator */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs gap-2 pt-1 border-t border-zinc-800/60">
            <div className="text-zinc-400">
              الإجمالي الفرعي:{' '}
              <span className="text-amber-400 font-bold font-mono text-sm">
                {(product.cartonPrice * quantity).toLocaleString()} دج
              </span>
              <span className="text-[10px] text-zinc-500 mr-2">
                ({quantity * (product.cartonQuantity || 20)} حبة)
              </span>
            </div>

            <div className="text-zinc-500 text-[11px]">
              {isAvailable ? (
                <span className="text-emerald-400">
                  متوفر جاهز للشحن في مستودع البليدة ({currentStock} كرتونة)
                </span>
              ) : (
                <span className="text-amber-400">
                  الكمية غير كافية، سيتم جدولة التصنيع كطلب مسبق
                </span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
