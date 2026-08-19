'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Eye, Clock, ArrowLeft, ShieldCheck, Lock } from 'lucide-react';
import { Product } from '@/types';
import { useCart } from '@/lib/cart-context';
import { Badge } from '@/components/ui/Badge';

interface ProductCardProps {
  product: Product & { priceHidden?: boolean; tierLabel?: string };
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();
  const [imageError, setImageError] = useState(false);
  const isAvailable = product.stock > 0 && product.active && (!product.flavor || product.flavor.active);

  const hasValidImage = product.imageUrl && !imageError;
  const brandName = product.brand?.name || 'Master Chips';
  const flavorName = product.flavor?.arabicName || 'أصلي';
  const isPriceHidden = Boolean(product.priceHidden || product.cartonPrice === 0);

  return (
    <div className="group relative rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-amber-500/5">
      {/* Top Badges */}
      <div className="p-4 pb-0 flex items-center justify-between z-10">
        <Badge variant={isAvailable ? 'success' : 'warning'}>
          {isAvailable ? 'متوفر' : 'طلب مسبق'}
        </Badge>
        <span className="text-xs font-bold text-amber-400 tracking-wide">
          {brandName}
        </span>
      </div>

      {/* Product Image or Luxury Minimal Placeholder */}
      <Link
        href={`/products/${product.id}`}
        className="block relative px-6 py-4 group-hover:scale-105 transition-transform duration-300"
      >
        <div className="w-full h-44 sm:h-48 flex items-center justify-center relative">
          {hasValidImage ? (
            <img
              src={product.imageUrl!}
              alt={product.arabicName}
              onError={() => setImageError(true)}
              className="max-h-44 sm:max-h-48 w-auto max-w-full object-contain drop-shadow-2xl mx-auto transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="w-36 h-44 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-950 border border-amber-400/20 flex flex-col items-center justify-center p-3 text-center shadow-2xl relative overflow-hidden group-hover:border-amber-400/60 transition-colors">
              <div className="absolute -top-6 -right-6 w-16 h-16 bg-amber-400/10 rounded-full blur-lg"></div>
              <span className="text-[11px] font-black text-amber-400 uppercase tracking-wider mb-1">
                {brandName}
              </span>
              <span className="text-sm font-bold text-zinc-100 line-clamp-2">
                {product.arabicName}
              </span>
              <span className="mt-2 text-xs px-2 py-0.5 rounded bg-zinc-800 text-amber-300 font-medium">
                {flavorName}
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Product Details & Pricing Info */}
      <div className="p-5 pt-0 text-right flex-1 flex flex-col justify-end space-y-3">
        <div>
          <div className="text-xs font-bold text-amber-400 mb-0.5">
            {brandName}
          </div>
          <Link href={`/products/${product.id}`}>
            <h3 className="text-base font-bold text-zinc-100 hover:text-amber-400 transition-colors line-clamp-1">
              {product.arabicName}
            </h3>
          </Link>
        </div>

        {/* Specs Table */}
        <div className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 text-xs space-y-1.5 font-mono">
          <div className="flex items-center justify-between text-zinc-400 font-sans">
            <span>النكهة:</span>
            <span className="font-bold text-zinc-200">{flavorName}</span>
          </div>
          <div className="flex items-center justify-between text-zinc-400 font-sans">
            <span>حجم الكرتونة:</span>
            <span className="font-bold text-zinc-300 font-mono">{product.cartonQuantity} قطعة / باكي</span>
          </div>
          <div className="flex items-center justify-between pt-1 border-t border-zinc-800/80 text-zinc-400 font-sans">
            <span className="font-bold text-zinc-300">السعر:</span>
            {isPriceHidden ? (
              <span className="inline-flex items-center gap-1 text-[11px] text-amber-400/90 font-bold font-sans">
                <Lock className="w-3 h-3" />
                <span>خاص بالتجار المعتمدين</span>
              </span>
            ) : (
              <div className="text-left">
                <span className="font-black text-amber-400 text-sm font-mono block">
                  {product.cartonPrice.toLocaleString()} دج
                </span>
                {product.tierLabel && (
                  <span className="text-[9px] text-zinc-400 block font-sans -mt-0.5">
                    ({product.tierLabel})
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-5 gap-2 pt-1">
          {isPriceHidden ? (
            <Link
              href="/verification"
              className="col-span-5 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-amber-400/10 hover:bg-amber-400 text-amber-400 hover:text-zinc-950 border border-amber-400/30 hover:border-amber-400 text-xs font-bold transition-all shadow-md shadow-amber-500/5"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>توثيق التاجر لعرض الأسعار</span>
            </Link>
          ) : isAvailable ? (
            <>
              <button
                onClick={() => addToCart(product, 1)}
                className="col-span-2 flex items-center justify-center p-2.5 rounded-xl bg-zinc-800 hover:bg-amber-400 hover:text-zinc-950 text-amber-400 transition-all border border-zinc-700 hover:border-amber-400 font-bold text-xs"
                title="أضف للسلة"
              >
                <ShoppingCart className="w-4 h-4" />
              </button>
              <Link
                href={`/products/${product.id}`}
                className="col-span-3 flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 text-xs font-bold transition-all shadow-md shadow-amber-500/10"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>تفاصيل المنتج</span>
              </Link>
            </>
          ) : (
            <Link
              href={`/products/${product.id}`}
              className="col-span-5 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-amber-400/10 hover:bg-amber-400 text-amber-400 hover:text-zinc-950 border border-amber-400/30 hover:border-amber-400 text-xs font-bold transition-all shadow-md shadow-amber-500/5"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>طلب مسبق</span>
              <ArrowLeft className="w-3.5 h-3.5 mr-auto" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};
