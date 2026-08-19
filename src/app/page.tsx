'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ProductCard } from '@/components/shop/ProductCard';
import { REAL_BRANDS, BUSINESS_INFO } from '@/lib/constants';
import { Product } from '@/types';
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  Headphones,
  Boxes,
  Users,
  Award,
  BadgePercent,
  Warehouse,
  Handshake,
  ArrowLeft,
  MessageCircle,
} from 'lucide-react';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      try {
        const res = await fetch('/api/products?limit=8&featured=true');
        if (res.ok) {
          const data = await res.json();
          if (data.products) {
            setFeaturedProducts(data.products);
          }
        }
      } catch (e) {
        console.warn('Could not load products:', e);
      } finally {
        setLoadingProducts(false);
      }
    }
    loadProducts();
  }, []);

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between selection:bg-amber-400 selection:text-zinc-950">
      <Navbar />

      <main className="flex-1 text-right">
        {/* 1. HERO SECTION (Matching media_1786905180512.png) */}
        <section className="relative overflow-hidden pt-8 pb-16 lg:py-20 border-b border-zinc-800/80">
          {/* Subtle Ambient Gold Glow */}
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              {/* Left / Center (RTL layout): Large 3D Emblem Showcase */}
              <div className="lg:col-span-6 flex justify-center order-2 lg:order-1 relative">
                <div className="relative w-[320px] h-[320px] sm:w-[460px] sm:h-[460px] flex items-center justify-center">
                  <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-amber-400/40 shadow-[0_0_50px_rgba(245,158,11,0.25)] bg-black animate-pulse-slow">
                    <Image
                      src="/images/hero-emblem.jpg"
                      alt="Distributeur Chips 09"
                      fill
                      className="object-contain p-2"
                      priority
                    />
                  </div>
                </div>
              </div>

              {/* Right: Bold Typography & Action CTAs */}
              <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
                <div className="space-y-2">
                  <h1 className="text-3xl sm:text-4xl lg:text-6xl font-black tracking-tight text-zinc-100 leading-tight">
                    توزيع الشيبس <br />
                    <span className="text-amber-400 drop-shadow-[0_4px_15px_rgba(245,158,11,0.4)]">
                      بالجملة
                    </span>
                  </h1>
                  <p className="text-sm sm:text-base text-zinc-300 max-w-xl leading-relaxed pt-2">
                    مجموعة واسعة من أفضل أنواع الشيبس بأسعار تنافسية وجودة مضمونة لجميع المحلات وتجار التجزئة في الجزائر.
                  </p>
                </div>

                {/* 2 Primary CTA Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link href="/catalog">
                    <button className="flex items-center gap-2.5 px-7 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-sm transition-all shadow-lg shadow-amber-500/25 transform hover:-translate-y-0.5">
                      <ShoppingBag className="w-4 h-4" />
                      <span>تسوق الآن</span>
                    </button>
                  </Link>

                  <a
                    href={BUSINESS_INFO.whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-zinc-900/90 border border-zinc-700 hover:border-emerald-500/50 text-zinc-100 font-bold text-sm transition-all shadow-md group"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>تواصل معنا</span>
                  </a>
                </div>

                {/* 3 Trust Assurances Pills in Row (From Screenshot) */}
                <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-zinc-800/80">
                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                    <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-zinc-200 block">جودة مضمونة</span>
                      <span className="text-[10px] text-zinc-400">منتجات أصلية 100%</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                    <Truck className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-zinc-200 block">توصيل سريع</span>
                      <span className="text-[10px] text-zinc-400">في جميع الولايات</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                    <Headphones className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <span className="text-xs font-bold text-zinc-200 block">خدمة العملاء</span>
                      <span className="text-[10px] text-zinc-400">متوفر 7/7</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. STATS BAR (4 KPIs with Gold Icons - Matching media_1786905180512.png) */}
        <section className="bg-zinc-950 border-b border-zinc-800/80 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex items-center justify-between px-6">
                <Truck className="w-8 h-8 text-amber-400" />
                <div className="text-right">
                  <span className="text-xs font-black text-zinc-100 block">توصيل لجميع الولايات</span>
                  <span className="text-[11px] text-zinc-400">في جميع أنحاء الجزائر</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex items-center justify-between px-6">
                <Award className="w-8 h-8 text-amber-400" />
                <div className="text-right">
                  <span className="text-2xl font-black text-amber-400 font-mono block">5</span>
                  <span className="text-[11px] text-zinc-400">علامات تجارية</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex items-center justify-between px-6">
                <Boxes className="w-8 h-8 text-amber-400" />
                <div className="text-right">
                  <span className="text-2xl font-black text-zinc-100 font-mono block">+20</span>
                  <span className="text-[11px] text-zinc-400">منتج متوفر</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex items-center justify-between px-6">
                <Users className="w-8 h-8 text-amber-400" />
                <div className="text-right">
                  <span className="text-2xl font-black text-zinc-100 font-mono block">+100</span>
                  <span className="text-[11px] text-zinc-400">زبون نشط</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. BRANDS SECTION ("تسوق حسب العلامة التجارية" - From Screenshot) */}
        <section className="py-12 bg-[#0a0a0e] border-b border-zinc-800/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <Link
                href="/catalog"
                className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors"
              >
                <span>عرض جميع المنتجات</span>
                <ArrowLeft className="w-4 h-4" />
              </Link>
              <h2 className="text-xl sm:text-2xl font-black text-amber-400">
                تسوق حسب <span className="text-zinc-100">العلامة التجارية</span>
              </h2>
            </div>

            {/* 5 Authentic Brand Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {REAL_BRANDS.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/catalog?brand=${brand.slug}`}
                  className="group p-5 rounded-2xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-400/60 flex flex-col items-center justify-center text-center transition-all duration-300 hover:-translate-y-1 shadow-lg hover:shadow-amber-500/10"
                >
                  <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 group-hover:border-amber-400/40 flex items-center justify-center mb-3 transition-colors">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-tight">
                      {brand.name.slice(0, 3)}
                    </span>
                  </div>
                  <h3 className="text-sm font-black text-zinc-100 group-hover:text-amber-400 transition-colors">
                    {brand.name}
                  </h3>
                  <span className="text-[11px] text-zinc-400 mt-0.5">{brand.arabicName}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* 4. FEATURED PRODUCTS GRID */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/catalog"
              className="flex items-center gap-1.5 text-xs font-bold text-amber-400 hover:text-amber-300"
            >
              <span>مشاهدة الكتالوج كاملاً</span>
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h2 className="text-2xl font-black text-zinc-100">
                أحدث منتجات <span className="text-amber-400">الشيبس بالجملة</span>
              </h2>
              <p className="text-xs text-zinc-400 mt-1">
                كراتين أصلية معتمدة مع تسعير جملة فوري
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>

        {/* 5. TRUST ASSURANCES FOOTER BAR (5 Cards in Row - From Screenshot) */}
        <section className="bg-zinc-950 border-t border-zinc-800/80 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 text-right">
              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex items-center gap-3">
                <Award className="w-7 h-7 text-amber-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-zinc-100 block">أفضل جودة</span>
                  <span className="text-[10px] text-zinc-400">نختار لكم الأفضل دائماً</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex items-center gap-3">
                <BadgePercent className="w-7 h-7 text-amber-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-zinc-100 block">أسعار تنافسية</span>
                  <span className="text-[10px] text-zinc-400">أفضل الأسعار في السوق</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex items-center gap-3">
                <Warehouse className="w-7 h-7 text-amber-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-zinc-100 block">توفير دائم</span>
                  <span className="text-[10px] text-zinc-400">المخزون متوفر دائماً</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex items-center gap-3">
                <Handshake className="w-7 h-7 text-amber-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-zinc-100 block">ثقة و مصداقية</span>
                  <span className="text-[10px] text-zinc-400">شريككم في النجاح</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 flex items-center gap-3 col-span-2 sm:col-span-1">
                <Headphones className="w-7 h-7 text-amber-400 shrink-0" />
                <div>
                  <span className="text-xs font-bold text-zinc-100 block">دعم متواصل</span>
                  <span className="text-[10px] text-zinc-400">فريق الدعم في خدمتكم</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
