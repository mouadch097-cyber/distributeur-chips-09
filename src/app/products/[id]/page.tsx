'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Badge } from '@/components/ui/Badge';
import { BUSINESS_INFO } from '@/lib/constants';
import { ProductDetailClient } from './ProductDetailClient';
import { ShieldCheck, Truck, PhoneCall, Loader2, AlertCircle, Lock } from 'lucide-react';
import { Product } from '@/types';

export default function ProductDetailPage() {
  const params = useParams();
  const id = params?.id as string;

  const [product, setProduct] = useState<(Product & { priceHidden?: boolean; tierLabel?: string }) | null>(null);
  const [availableVariants, setAvailableVariants] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await fetch(`/api/products/${id}`);
        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error || 'المنتج غير موجود');
        }
        const data = await res.json();
        setProduct(data.product);
        setAvailableVariants(data.availableVariants || []);
      } catch (e: any) {
        setError(e.message || 'حدث خطأ في الخادم');
      } finally {
        setLoading(false);
      }
    }
    if (id) loadProduct();
  }, [id]);

  const isPriceHidden = Boolean(product?.priceHidden || product?.cartonPrice === 0);

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full text-right">
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-amber-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <span className="text-xs text-zinc-400">جاري تحميل تفاصيل المنتج...</span>
          </div>
        ) : error || !product ? (
          <div className="p-8 rounded-2xl bg-red-950/30 border border-red-800 text-center">
            <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-3" />
            <h3 className="text-base font-bold text-red-200 mb-2">{error || 'المنتج غير موجود'}</h3>
            <Link href="/catalog">
              <span className="text-xs text-amber-400 hover:underline">العودة لكتالوج المنتجات</span>
            </Link>
          </div>
        ) : (
          <>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-zinc-400 mb-8">
              <Link href="/" className="hover:text-amber-400 transition-colors">
                الرئيسية
              </Link>
              <span>/</span>
              <Link href="/catalog" className="hover:text-amber-400 transition-colors">
                المنتجات
              </Link>
              <span>/</span>
              <span className="text-zinc-200 font-bold">{product.arabicName}</span>
            </div>

            {/* Product Details Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
              {/* Image Column */}
              <div className="lg:col-span-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 p-8 flex items-center justify-center relative min-h-[380px] shadow-2xl">
                {product.imageUrl ? (
                  <div className="relative w-full h-80 flex items-center justify-center">
                    <img
                      src={product.imageUrl}
                      alt={product.arabicName}
                      className="max-h-80 w-auto max-w-full object-contain drop-shadow-2xl mx-auto"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-60 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-950 border border-amber-400/30 flex flex-col items-center justify-center p-4 text-center shadow-2xl">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-widest mb-2">
                      {product.brand?.name}
                    </span>
                    <span className="text-base font-bold text-zinc-100 line-clamp-2">
                      {product.arabicName}
                    </span>
                    {product.flavor && (
                      <span className="mt-3 text-xs px-2.5 py-1 rounded bg-zinc-800 text-amber-300 font-medium">
                        {product.flavor.arabicName}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Info & Cart Actions Column */}
              <div className="lg:col-span-7 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant={product.stock > 0 ? 'success' : 'neutral'}>
                      {product.stock > 0 ? 'متوفر في المستودع' : 'نفذت الكمية'}
                    </Badge>
                    <span className="text-xs font-bold text-amber-400 tracking-wider">
                      {product.brand?.name}
                    </span>
                  </div>

                  <h1 className="text-2xl sm:text-3xl font-black text-zinc-100">
                    {product.arabicName}
                  </h1>

                  {product.flavor && (
                    <p className="text-sm text-zinc-400">
                      النكهة: <span className="text-zinc-200 font-bold">{product.flavor.arabicName}</span>
                    </p>
                  )}
                </div>

                {/* Description */}
                {product.description && (
                  <p className="text-sm text-zinc-300 leading-relaxed bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/80">
                    {product.description}
                  </p>
                )}

                {/* Specs Boxes */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[11px] text-zinc-400 block">سعر الباكي (Pack)</span>
                    <span className="text-sm font-black text-amber-400 font-mono">
                      {isPriceHidden ? (
                        <span className="text-xs text-zinc-400 font-sans">محجوب</span>
                      ) : (
                        `${product.unitPrice.toLocaleString()} دج`
                      )}
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[11px] text-zinc-400 block">حجم الكرتونة</span>
                    <span className="text-sm font-bold text-zinc-100 font-mono">
                      {product.cartonQuantity} باكي
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800">
                    <span className="text-[11px] text-zinc-400 block">المخزون المتوفر</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      {product.stock} كرتون
                    </span>
                  </div>
                </div>

                {/* Price Highlight */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900 to-zinc-950 border border-amber-400/30 flex items-center justify-between">
                  <div className="text-right">
                    <span className="text-xs text-zinc-400 block">سعر الكرتونة:</span>
                    <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-0.5">
                      {isPriceHidden ? (
                        <span className="text-base font-bold text-amber-400/90 font-sans flex items-center gap-1.5">
                          <Lock className="w-4 h-4" />
                          <span>خاص بالتجار المعتمدين</span>
                        </span>
                      ) : (
                        `${product.cartonPrice.toLocaleString()} دج`
                      )}
                    </div>
                  </div>

                  <div className="text-left space-y-1">
                    {isPriceHidden ? (
                      <Link href="/verification">
                        <span className="text-[11px] px-3 py-1 rounded-full bg-amber-400/10 text-amber-300 font-bold border border-amber-400/30 hover:bg-amber-400 hover:text-zinc-950 transition-colors block text-center">
                          توثيق التاجر
                        </span>
                      </Link>
                    ) : (
                      <>
                        <span className="text-xs text-zinc-400 block font-mono">
                          {product.unitPrice.toLocaleString()} دج / باكي
                        </span>
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-amber-400/10 text-amber-300 font-bold border border-amber-400/20 block text-center">
                          {product.tierLabel || 'سعر الجملة'}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Client Add to Cart Component */}
                <ProductDetailClient
                  product={product}
                  availableVariants={availableVariants}
                />

                {/* Trust Badges */}
                <div className="pt-6 border-t border-zinc-800/80 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-zinc-400">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>ضمان الجودة والأصالة</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-amber-400" />
                    <span>توصيل سريع للمحلات</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-4 h-4 text-amber-400" />
                    <span>دعم مباشر: {BUSINESS_INFO.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
