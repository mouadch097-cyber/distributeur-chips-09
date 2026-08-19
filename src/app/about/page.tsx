'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { BUSINESS_INFO } from '@/lib/constants';
import {
  ShieldCheck,
  Truck,
  Headphones,
  Users,
  Boxes,
  Award,
  BadgePercent,
  Handshake,
  MessageCircle,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  Phone,
} from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between selection:bg-amber-400 selection:text-zinc-950">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full text-right">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-6">
          <Link href="/" className="hover:text-amber-400">الرئيسية</Link>
          <span>&gt;</span>
          <span className="text-zinc-200 font-bold">من نحن</span>
        </div>

        {/* 1. Hero Showcase (Matching media_1786905406115.png) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-16">
          {/* Left: Warehouse & Delivery Truck Showcase */}
          <div className="lg:col-span-6 relative order-2 lg:order-1">
            <div className="rounded-3xl bg-zinc-900/90 border border-zinc-800 p-6 shadow-2xl relative overflow-hidden">
              {/* Experience Badge */}
              <div className="absolute top-6 left-6 z-20 flex items-center gap-3 p-3 rounded-2xl bg-zinc-950/80 border border-amber-400/30 backdrop-blur-md shadow-lg">
                <div className="text-right">
                  <span className="text-[10px] text-zinc-400 block font-bold">خبرة تتجاوز</span>
                  <span className="text-xl font-black text-amber-400 font-mono">10</span>
                  <span className="text-[10px] text-zinc-300 block">سنوات في المجال</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
              </div>

              {/* Central Visual */}
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-zinc-950 flex items-center justify-center">
                <Image
                  src="/images/hero-emblem.jpg"
                  alt="Distributeur Chips 09 Logistics"
                  fill
                  className="object-contain p-4"
                />
              </div>
            </div>
          </div>

          {/* Right: Typography & Assurances */}
          <div className="lg:col-span-6 space-y-6 order-1 lg:order-2">
            <div>
              <h1 className="text-4xl sm:text-5xl font-black text-zinc-100">
                من <span className="text-amber-400">نحن</span>
              </h1>
              <p className="text-base text-amber-400/90 font-bold mt-2">
                شريكك الموثوق في توزيع الشيبس بالجملة
              </p>
            </div>

            <p className="text-sm text-zinc-300 leading-relaxed">
              نحن في <span className="font-bold text-amber-400">Distributeur Chips 09</span> متخصصون في توزيع الشيبس بالجملة في جميع أنحاء الجزائر. نوفر أفضل العلامات التجارية بجودة عالية وأسعار تنافسية مع خدمة سريعة وموثوقة تلبي احتياجات عملائنا من أصحاب المحلات والسوبرماركت وتجار التجزئة.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs text-zinc-200">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>منتجات أصلية 100% من أفضل العلامات التجارية</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-200">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>توصيل سريع وموثوق في جميع أنحاء الجزائر</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-200">
                <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span>خدمة عملاء متاحة 7/7 لمساعدتك في كل وقت</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. 5 Stats Bar (From Screenshot) */}
        <section className="bg-zinc-950 border border-zinc-800/80 rounded-3xl p-6 sm:p-8 mb-16 shadow-xl">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 text-center">
            <div className="p-3">
              <span className="text-2xl font-black text-amber-400 font-mono block">+500</span>
              <span className="text-xs text-zinc-400 mt-1 block">عميل نشط</span>
            </div>

            <div className="p-3">
              <span className="text-2xl font-black text-zinc-100 font-mono block">+200</span>
              <span className="text-xs text-zinc-400 mt-1 block">منتج متوفر</span>
            </div>

            <div className="p-3">
              <span className="text-2xl font-black text-amber-400 font-mono block">58</span>
              <span className="text-xs text-zinc-400 mt-1 block">ولاية مخدومة</span>
            </div>

            <div className="p-3">
              <span className="text-2xl font-black text-zinc-100 font-mono block">24/48</span>
              <span className="text-xs text-zinc-400 mt-1 block">ساعة توصيل سريع</span>
            </div>

            <div className="p-3 col-span-2 sm:col-span-1">
              <span className="text-2xl font-black text-amber-400 font-mono block">+100%</span>
              <span className="text-xs text-zinc-400 mt-1 block">منتجات أصلية</span>
            </div>
          </div>
        </section>

        {/* 3. "لماذا تختارنا؟" + "شبكة توزيع قوية" (From Screenshot) */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-amber-400 inline-block px-6 py-2 rounded-2xl bg-zinc-900 border border-zinc-800">
              لماذا تختارنا؟
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* 5 Reasons Grid (8 cols) */}
            <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                <Award className="w-8 h-8 text-amber-400 mb-2" />
                <h3 className="text-sm font-black text-zinc-100">جودة مضمونة</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  نلتزم بتوفير منتجات أصلية بأعلى معايير الجودة والتخزين.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                <BadgePercent className="w-8 h-8 text-amber-400 mb-2" />
                <h3 className="text-sm font-black text-zinc-100">أسعار تنافسية</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  أفضل الأسعار في السوق لتحقيق أعلى هامش ربح لمتجركم.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                <Truck className="w-8 h-8 text-amber-400 mb-2" />
                <h3 className="text-sm font-black text-zinc-100">توصيل سريع</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  توصيل لجميع الولايات في وقت قياسي وبأمان تام.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-2">
                <Headphones className="w-8 h-8 text-amber-400 mb-2" />
                <h3 className="text-sm font-black text-zinc-100">دعم متواصل</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  فريق دعم محترف متاح 7 أيام / 7 لمتابعة طلبياتكم.
                </p>
              </div>

              <div className="p-6 rounded-3xl bg-zinc-900/90 border border-zinc-800 space-y-2 sm:col-span-2 lg:col-span-2">
                <Handshake className="w-8 h-8 text-amber-400 mb-2" />
                <h3 className="text-sm font-black text-zinc-100">ثقة وشراكة</h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  نحن نبني علاقات طويلة الأمد مع عملائنا وندعم نمو أعمالهم وتجارتهم.
                </p>
              </div>
            </div>

            {/* Distribution Network Card (4 cols) */}
            <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-zinc-900/90 border border-amber-400/30 flex flex-col justify-between shadow-2xl">
              <div className="space-y-4">
                <h3 className="text-lg font-black text-amber-400">شبكة توزيع قوية</h3>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  نغطي جميع الولايات الجزائرية بشبكة توزيع واسعة تضمن وصول منتجاتنا إليك بسرعة وأمان مع كامل الفواتير المعتمدة.
                </p>
              </div>

              <div className="pt-6">
                <a
                  href={BUSINESS_INFO.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>تواصل معنا عبر واتساب</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Bottom Contact Info Strip (From Screenshot) */}
        <section className="rounded-3xl bg-zinc-950 border border-zinc-800 p-6 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center sm:text-right">
          <div className="flex items-center justify-center sm:justify-start gap-3">
            <MapPin className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-zinc-200 block">تواجدنا</span>
              <span className="text-[11px] text-zinc-400">الجزائر - خدمة في جميع الولايات</span>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <Mail className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-zinc-200 block">راسلنا عبر البريد الإلكتروني</span>
              <span className="text-[11px] text-zinc-400 font-mono">{BUSINESS_INFO.email}</span>
            </div>
          </div>

          <div className="flex items-center justify-center sm:justify-start gap-3">
            <MessageCircle className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-zinc-200 block">تواصل معنا على واتساب</span>
              <span className="text-[11px] text-emerald-400 font-mono font-bold">{BUSINESS_INFO.phone}</span>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
