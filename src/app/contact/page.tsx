'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { WILAYAS, BUSINESS_INFO, REAL_BRANDS } from '@/lib/constants';
import {
  Headphones,
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Building2,
  User,
  Edit2,
  Lock,
} from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [phone, setPhone] = useState('');
  const [wilaya, setWilaya] = useState('16 - الجزائر العاصمة');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [captchaChecked, setCaptchaChecked] = useState(true);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!captchaChecked) {
      setError('يرجى التحقق من اختبار الكابتشا');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: name.trim(),
          name: name.trim(),
          companyName: companyName.trim(),
          phone: phone.trim(),
          email: email.trim() || undefined,
          wilaya,
          subject: companyName ? `طلب توريد من متجر: ${companyName}` : 'استفسار مبيعات جملة',
          message: message.trim(),
          botField: '',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'فشل إرسال الرسالة');
      }

      setSuccess(true);
      setName('');
      setCompanyName('');
      setPhone('');
      setMessage('');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء الإرسال');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between selection:bg-amber-400 selection:text-zinc-950">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full text-right">
        {/* 1. TOP HERO SHOWCASE (Matching media_1786905642916.png) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center mb-12 relative overflow-hidden pt-4 pb-8">
          {/* Left: 5 Authentic Chips Bags Showcase */}
          <div className="lg:col-span-6 flex items-center justify-center order-2 lg:order-1 relative">
            <div className="relative flex items-end justify-center gap-1 sm:gap-2 p-6 rounded-3xl bg-zinc-950/40 border border-zinc-800/80 shadow-2xl">
              {REAL_BRANDS.map((brand, idx) => (
                <div
                  key={brand.slug}
                  className="w-14 sm:w-20 h-28 sm:h-36 rounded-2xl bg-gradient-to-b from-zinc-800 to-zinc-950 border border-amber-400/30 flex flex-col items-center justify-between p-2 text-center shadow-2xl transform hover:-translate-y-2 transition-all duration-300"
                  style={{
                    transform: `rotate(${(idx - 2) * 4}deg) translateY(${Math.abs(idx - 2) * 4}px)`,
                  }}
                >
                  <span className="text-[7px] sm:text-[9px] font-black text-amber-400 tracking-tighter uppercase leading-tight line-clamp-1">
                    {brand.name}
                  </span>
                  <span className="text-[10px] sm:text-xs font-black text-zinc-100 my-auto leading-tight">
                    {brand.arabicName}
                  </span>
                  <div className="w-2 h-2 rounded-full bg-amber-400/60" />
                </div>
              ))}
            </div>
          </div>

          {/* Right: Gold Headset Circle & Headline */}
          <div className="lg:col-span-6 flex flex-col items-end text-right space-y-4 order-1 lg:order-2">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-amber-400/80 bg-amber-400/10 flex items-center justify-center text-amber-400 shadow-xl shadow-amber-500/10 shrink-0">
                <Headphones className="w-8 h-8 sm:w-10 sm:h-10" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-5xl font-black text-zinc-100 tracking-tight">
                  اتصل بنا <br />
                  <span className="text-amber-400 drop-shadow-[0_2px_10px_rgba(245,158,11,0.4)]">
                    نحن هنا لخدمتكم
                  </span>
                </h1>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-zinc-300 max-w-lg leading-relaxed pt-1">
              فريق إدارة المبيعات جاهز للرد على جميع استفساراتكم وترتيب توريد كراتين الشيبس لمتجركم وتقديم أفضل الحلول لعملكم في جميع ولايات الجزائر.
            </p>
          </div>
        </section>

        {/* 2. THREE MAIN CARDS (Matching 5+3+4 Grid in media_1786905642916.png) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-12 items-stretch">
          {/* Card 1: "أرسل لنا رسالة" (Form) - 5 Columns (RTL Right side) */}
          <div className="lg:col-span-5 rounded-3xl bg-zinc-900/90 border border-zinc-800 p-6 sm:p-7 flex flex-col justify-between shadow-2xl order-1">
            <div>
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-800">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <h2 className="text-base font-black text-zinc-100">أرسل لنا رسالة</h2>
              </div>

              {success ? (
                <div className="p-6 rounded-2xl bg-emerald-950/40 border border-emerald-800 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                  <h3 className="text-sm font-bold text-zinc-100">تم إرسال رسالتك بنجاح!</h3>
                  <p className="text-xs text-zinc-300">
                    شكراً لتواصلك معنا. سيقوم مسؤول المبيعات بالرد عليك في أقرب وقت.
                  </p>
                  <Button variant="outline" size="sm" onClick={() => setSuccess(false)}>
                    إرسال رسالة أخرى
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3.5">
                  {error && (
                    <div className="p-3 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Name + Store Name */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative">
                      <label className="block text-[11px] font-bold text-zinc-300 mb-1 flex items-center justify-end gap-1">
                        <span>الاسم الكامل *</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          placeholder="محمد بلقاسم"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400 text-right"
                        />
                        <User className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-[11px] font-bold text-zinc-300 mb-1 flex items-center justify-end gap-1">
                        <span>اسم المحل / المتجر</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="سوبرماركت البركة"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400 text-right"
                        />
                        <Building2 className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                      </div>
                    </div>
                  </div>

                  {/* Wilaya + Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative">
                      <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                        <span>الولاية *</span>
                      </label>
                      <div className="relative">
                        <select
                          value={wilaya}
                          onChange={(e) => setWilaya(e.target.value)}
                          required
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-400 text-right appearance-none"
                        >
                          {WILAYAS.map((w) => (
                            <option key={w.code} value={`${w.code} - ${w.name}`}>
                              {w.code} - {w.name}
                            </option>
                          ))}
                        </select>
                        <MapPin className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5 pointer-events-none" />
                      </div>
                    </div>

                    <div className="relative">
                      <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                        <span>رقم الهاتف *</span>
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          required
                          placeholder="0541655938"
                          className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400 text-right font-mono"
                        />
                        <Phone className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                      </div>
                    </div>
                  </div>

                  {/* Email */}
                  <div className="relative">
                    <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                      <span>البريد الإلكتروني (اختياري)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="example@email.com"
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400 text-right font-mono"
                      />
                      <Mail className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  {/* Message */}
                  <div className="relative">
                    <label className="block text-[11px] font-bold text-zinc-300 mb-1">
                      <span>الرسالة أو طلب الطلبية *</span>
                    </label>
                    <div className="relative">
                      <textarea
                        rows={3}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required
                        placeholder="اكتب استفسارك أو قائمة الكراتين المطلوبة هنا..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-400 text-right resize-none"
                      />
                      <Edit2 className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-2.5" />
                    </div>
                  </div>

                  {/* reCAPTCHA Simulator & Submit */}
                  <div className="pt-2 space-y-3">
                    <label className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 cursor-pointer">
                      <span className="text-[11px] text-zinc-400">أنا لست روبوت</span>
                      <input
                        type="checkbox"
                        checked={captchaChecked}
                        onChange={(e) => setCaptchaChecked(e.target.checked)}
                        className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-amber-500 focus:ring-amber-400"
                      />
                    </label>

                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      isLoading={loading}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      <span>إرسال الرسالة</span>
                    </Button>
                  </div>

                  <p className="text-[10px] text-zinc-500 text-center flex items-center justify-center gap-1 pt-1">
                    <Lock className="w-3 h-3 text-amber-400" />
                    <span>معلوماتك آمنة ولن يتم مشاركتها مع أي طرف ثالث</span>
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* Card 2: "معلومات التواصل" (Contact Info) - 3 Columns (RTL Center) */}
          <div className="lg:col-span-3 rounded-3xl bg-zinc-900/90 border border-zinc-800 p-6 sm:p-7 flex flex-col justify-between shadow-2xl order-2">
            <div>
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-800">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <h2 className="text-base font-black text-zinc-100">معلومات التواصل</h2>
              </div>

              <div className="space-y-4">
                {/* Email */}
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] text-zinc-400 font-bold">البريد الإلكتروني</span>
                  </div>
                  <a
                    href={`mailto:${BUSINESS_INFO.email}`}
                    className="text-xs text-zinc-200 font-mono hover:text-amber-400 block pt-1 truncate"
                  >
                    {BUSINESS_INFO.email}
                  </a>
                </div>

                {/* Phone */}
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] text-zinc-400 font-bold">رقم الهاتف / واتساب</span>
                  </div>
                  <span className="text-xs text-zinc-200 font-mono font-bold block pt-1">
                    {BUSINESS_INFO.phone}
                  </span>
                </div>

                {/* International WhatsApp */}
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <MessageCircle className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] text-zinc-400 font-bold">واتساب دولي</span>
                  </div>
                  <span className="text-xs text-emerald-400 font-mono font-bold block pt-1">
                    {BUSINESS_INFO.phoneInternational}
                  </span>
                </div>

                {/* Working Hours */}
                <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="w-7 h-7 rounded-lg bg-amber-400/10 text-amber-400 flex items-center justify-center">
                      <Clock className="w-3.5 h-3.5" />
                    </div>
                    <span className="text-[10px] text-zinc-400 font-bold">ساعات العمل</span>
                  </div>
                  <div className="text-[11px] text-zinc-300 pt-1 leading-relaxed">
                    <p>السبت - الخميس: 08:00 - 18:00</p>
                    <p className="text-zinc-500 text-[10px]">الجمعة: عطلة أسبوعية</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: "موقعنا" (Map View) - 4 Columns (RTL Left side) */}
          <div className="lg:col-span-4 rounded-3xl bg-zinc-900/90 border border-zinc-800 p-6 sm:p-7 flex flex-col justify-between shadow-2xl order-3">
            <div>
              <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-800">
                <div className="w-2 h-2 rounded-full bg-amber-400" />
                <h2 className="text-base font-black text-zinc-100">موقعنا</h2>
              </div>

              {/* Simulated Luxury Dark Map with Golden Pin */}
              <div className="relative aspect-[4/3] w-full rounded-2xl bg-zinc-950 border border-zinc-800 p-4 flex flex-col items-center justify-center text-center overflow-hidden mb-4 shadow-inner">
                <div className="absolute inset-0 bg-[radial-gradient(#27272a_1.5px,transparent_1.5px)] [background-size:16px_16px] opacity-40" />

                {/* Simulated Road Grid Lines */}
                <div className="absolute inset-0 opacity-20 pointer-events-none">
                  <div className="absolute top-1/3 left-0 right-0 h-px bg-zinc-600 transform -rotate-12" />
                  <div className="absolute top-2/3 left-0 right-0 h-px bg-zinc-600 transform rotate-6" />
                  <div className="absolute top-0 bottom-0 left-1/3 w-px bg-zinc-600 transform rotate-12" />
                  <div className="absolute top-0 bottom-0 right-1/3 w-px bg-zinc-600 transform -rotate-6" />
                </div>

                <div className="relative z-10 space-y-2.5">
                  <div className="w-12 h-12 rounded-full bg-amber-400/20 border-2 border-amber-400 flex items-center justify-center text-amber-400 mx-auto shadow-lg shadow-amber-500/30 animate-bounce">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div className="bg-zinc-900/95 border border-amber-400/50 px-3.5 py-1.5 rounded-xl shadow-xl">
                    <span className="text-xs font-black text-amber-400 block">Distributeur Chips 09</span>
                    <span className="text-[10px] text-zinc-400">مركز التوزيع المعتمد</span>
                  </div>
                </div>
              </div>

              {/* Coverage Info */}
              <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800/80">
                <MapPin className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-xs font-bold text-zinc-100 block">نتواجد في جميع الولايات الجزائرية</span>
                  <span className="text-[11px] text-zinc-400 leading-relaxed block mt-0.5">
                    خدمة توزيع سريعة وموثوقة إلى جميع مناطق القطر الوطني.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. IMMEDIATE HELP CTA STRIP (Matching media_1786905642916.png) */}
        <section className="rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-amber-400/30 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-2xl mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-zinc-100">تحتاج إلى مساعدة فورية؟</h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                تواصل معنا مباشرة عبر واتساب وسنرد عليك في أقرب وقت ممكن.
              </p>
            </div>
          </div>

          <a
            href={BUSINESS_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs transition-all shadow-lg shadow-emerald-500/20"
          >
            <MessageCircle className="w-4 h-4" />
            <span>تواصل عبر واتساب</span>
          </a>
        </section>
      </main>

      <Footer />
    </div>
  );
}
