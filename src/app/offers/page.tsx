'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EmptyState } from '@/components/ui/EmptyState';
import { BUSINESS_INFO } from '@/lib/constants';
import {
  Sparkles,
  Truck,
  ShieldCheck,
  Clock,
  MessageCircle,
  Tag,
  Loader2,
} from 'lucide-react';
import { Offer } from '@/types';

export default function OffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadOffers() {
      try {
        const res = await fetch('/api/offers');
        if (res.ok) {
          const data = await res.json();
          setOffers(data.offers || []);
        }
      } catch (e) {
        console.error('Error fetching offers:', e);
      } finally {
        setLoading(false);
      }
    }
    loadOffers();
  }, []);

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between selection:bg-amber-400 selection:text-zinc-950">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full text-right">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
          <Link href="/" className="hover:text-amber-400">الرئيسية</Link>
          <span>&gt;</span>
          <span className="text-zinc-200 font-bold">العروض والخصومات</span>
        </div>

        {/* 1. Header with Title & Top 3 Features */}
        <section className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pb-8 mb-8 border-b border-zinc-800">
          {/* Left: 3 Quick Features */}
          <div className="flex flex-wrap items-center gap-4 text-xs order-2 lg:order-1">
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <Clock className="w-4 h-4 text-amber-400" />
              <div>
                <span className="font-bold text-zinc-200 block">لفترة محدودة</span>
                <span className="text-[10px] text-zinc-400">سارع قبل نفاد الكمية</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <div>
                <span className="font-bold text-zinc-200 block">جودة مضمونة</span>
                <span className="text-[10px] text-zinc-400">منتجات أصلية 100%</span>
              </div>
            </div>

            <div className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-900/60 border border-zinc-800">
              <Truck className="w-4 h-4 text-amber-400" />
              <div>
                <span className="font-bold text-zinc-200 block">توصيل سريع</span>
                <span className="text-[10px] text-zinc-400">شاحنات توزيع منتظمة</span>
              </div>
            </div>
          </div>

          {/* Right: Main Headline */}
          <div className="order-1 lg:order-2 space-y-1">
            <h1 className="text-3xl sm:text-4xl font-black text-zinc-100">
              العروض <span className="text-amber-400">والخصومات</span>
            </h1>
            <p className="text-xs sm:text-sm text-zinc-300 flex items-center gap-1.5 justify-end">
              <span>أفضل أسعار الجملة على كراتين الشيبس لفترة محدودة</span>
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            </p>
          </div>
        </section>

        {/* 2. Offers List or Empty State */}
        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-amber-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <span className="text-xs text-zinc-400">جاري تحميل العروض المتاحة...</span>
          </div>
        ) : offers.length === 0 ? (
          <EmptyState
            title="لا توجد عروض ترويجية نشطة حالياً."
            description="يتم تحديث العروض الترويجية والخصومات الموسمية بانتظام. يمكنك التواصل معنا مباشرة للاستفسار عن أسعار الكميات الكبيرة."
            actionText="تصفح كتالوج المنتجات"
            actionHref="/catalog"
            icon={<Tag className="w-8 h-8" />}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
            {offers.map((offer) => (
              <div
                key={offer.id}
                className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 hover:border-amber-400/50 transition-all duration-300 flex flex-col justify-between text-right relative overflow-hidden shadow-xl hover:-translate-y-1"
              >
                {/* Discount Badge */}
                <div className="flex items-center justify-between mb-4">
                  {offer.discountPercent ? (
                    <span className="px-3 py-1 rounded-full bg-amber-400 text-zinc-950 text-xs font-black font-mono">
                      -{offer.discountPercent}%
                    </span>
                  ) : (
                    <span className="px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/30 text-amber-400 text-xs font-black">
                      عرض خاص
                    </span>
                  )}

                  {offer.validUntil && (
                    <span className="text-[11px] text-zinc-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-amber-400" />
                      <span>{new Date(offer.validUntil).toLocaleDateString('ar-DZ')}</span>
                    </span>
                  )}
                </div>

                {/* Graphic Icon Preview */}
                <div className="relative h-32 w-full rounded-2xl bg-zinc-950 border border-zinc-800/80 mb-4 flex items-center justify-center p-3">
                  <div className="text-center space-y-1">
                    <div className="w-12 h-12 rounded-xl bg-amber-400/10 border border-amber-400/20 flex items-center justify-center text-amber-400 mx-auto">
                      <Tag className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-black text-zinc-300 block">
                      باقة توفير خاصة
                    </span>
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-1.5 mb-4 flex-1">
                  <h3 className="text-base font-black text-zinc-100">{offer.arabicTitle}</h3>
                  {offer.description && (
                    <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3 whitespace-pre-wrap">
                      {offer.description}
                    </p>
                  )}
                </div>

                {/* Pricing if bundle */}
                {offer.bundlePrice && (
                  <div className="pt-3 border-t border-zinc-800/80 mb-4 flex items-center justify-between">
                    <span className="text-xs text-zinc-500">سعر العرض:</span>
                    <span className="text-lg font-black text-amber-400 font-mono">
                      {offer.bundlePrice.toLocaleString()} دج
                    </span>
                  </div>
                )}

                {/* WhatsApp Action Button */}
                <a
                  href={`https://wa.me/213541655938?text=${encodeURIComponent(
                    `مرحباً، أود الاستفسار والطلب بخصوص: ${offer.arabicTitle}`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-all shadow-md"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>طلب العرض عبر واتساب</span>
                </a>
              </div>
            ))}
          </div>
        )}

        {/* 3. Bulk Discounts Banner */}
        <section className="rounded-3xl bg-zinc-950 border border-zinc-800/80 p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl mb-12">
          <div className="space-y-2">
            <h3 className="text-xl font-black text-zinc-100">خصومات خاصة للكميات الكبيرة والتوزيع الأسبوعي</h3>
            <p className="text-xs text-zinc-400 leading-relaxed max-w-xl">
              إذا كنت تملك سوبرماركت أو محلاً تجارياً وتريد استلام طلبيات شاحنات منتظمة، اتصل بنا للاستفادة من تسعيرة الموزع الحصرية.
            </p>
          </div>

          <a
            href={BUSINESS_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20"
          >
            <MessageCircle className="w-4 h-4" />
            <span>تواصل مع قسم المبيعات</span>
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
}
