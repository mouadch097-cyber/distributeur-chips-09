'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { AccountSidebar } from '@/components/account/AccountSidebar';
import { ProductCard } from '@/components/shop/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Product } from '@/types';
import { Heart, Loader2 } from 'lucide-react';

export default function FavoritesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFavorites() {
      try {
        const res = await fetch('/api/products?featured=true');
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products?.slice(0, 4) || []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadFavorites();
  }, []);

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full text-right">
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
          <Link href="/" className="hover:text-amber-400">الرئيسية</Link>
          <span>&gt;</span>
          <span className="text-zinc-200 font-bold">المنتجات المفضلة</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-9 space-y-6">
            <div className="pb-4 border-b border-zinc-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2.5 mb-1">
                  <Heart className="w-6 h-6 text-amber-400 fill-amber-400" />
                  <h1 className="text-2xl font-black text-zinc-100">المفضلة</h1>
                </div>
                <p className="text-xs text-zinc-400">المنتجات التي قمت بحفظها لطلبها بانتظام</p>
              </div>
            </div>

            {loading ? (
              <div className="py-24 flex flex-col items-center justify-center text-amber-400">
                <Loader2 className="w-8 h-8 animate-spin mb-3" />
                <span className="text-xs text-zinc-400">جاري تحميل المفضلة...</span>
              </div>
            ) : products.length === 0 ? (
              <EmptyState
                title="لا توجد منتجات مفضلة حالياً."
                description="اضغط على أيقونة القلب في أي صنف بالكتالوج لحفظه في قائمتك المفضلة."
                actionText="تصفح الكتالوج"
                actionHref="/catalog"
                icon={<Heart className="w-8 h-8" />}
              />
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-3">
            <AccountSidebar />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
