'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { BUSINESS_INFO, REAL_BRANDS } from '@/lib/constants';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-800/80 text-zinc-400 mt-20 select-none text-right">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {/* Column 1: Brand & Social */}
          <div className="space-y-4 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-amber-400/90 overflow-hidden relative shadow-lg shadow-amber-500/10 shrink-0 bg-black">
                <Image
                  src="/images/logo.jpg"
                  alt="Distributeur Chips 09"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-base font-black text-zinc-100">{BUSINESS_INFO.name}</h3>
                <span className="text-[11px] text-amber-400 font-bold block">توزيع الشيبس بالجملة</span>
              </div>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed">
              شريكك الموثوق في توزيع الشيبس بالجملة في جميع أنحاء الجزائر. نقدم منتجات أصلية بأفضل الأسعار وأسرع خدمة.
            </p>

            {/* Social Icons */}
            <div className="flex items-center gap-2 pt-2">
              <a
                href={BUSINESS_INFO.whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 hover:border-emerald-500 text-zinc-400 hover:text-emerald-400 flex items-center justify-center transition-colors"
                aria-label="WhatsApp"
              >
                <MessageCircle className="w-4 h-4" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 hover:border-blue-500 text-zinc-400 hover:text-blue-400 flex items-center justify-center transition-colors text-xs font-black"
                aria-label="Facebook"
              >
                f
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 hover:border-pink-500 text-zinc-400 hover:text-pink-400 flex items-center justify-center transition-colors text-xs font-black"
                aria-label="Instagram"
              >
                ig
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-4 border-b border-zinc-800/80 pb-2">
              روابط سريعة
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-amber-400 transition-colors">
                  الرئيسية
                </Link>
              </li>
              <li>
                <Link href="/catalog" className="hover:text-amber-400 transition-colors">
                  المنتجات
                </Link>
              </li>
              <li>
                <Link href="/offers" className="hover:text-amber-400 transition-colors">
                  العروض
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-amber-400 transition-colors">
                  الطلبات
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-400 transition-colors">
                  من نحن
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-400 transition-colors">
                  اتصل بنا
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Customer Service */}
          <div>
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-4 border-b border-zinc-800/80 pb-2">
              خدمة العملاء
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/contact" className="hover:text-amber-400 transition-colors">
                  الأسئلة الشائعة
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-400 transition-colors">
                  سياسة الخصوصية
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-amber-400 transition-colors">
                  الشروط والأحكام
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-amber-400 transition-colors">
                  سياسة الاسترجاع
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-amber-400 transition-colors">
                  تتبع الطلب
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Verified Brands */}
          <div>
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-4 border-b border-zinc-800/80 pb-2">
              المنتجات والعلامات
            </h4>
            <ul className="space-y-2 text-xs">
              {REAL_BRANDS.map((brand) => (
                <li key={brand.slug}>
                  <Link
                    href={`/catalog?brand=${brand.slug}`}
                    className="hover:text-amber-400 transition-colors flex items-center justify-between"
                  >
                    <span>{brand.name}</span>
                    <span className="text-[10px] text-zinc-500">{brand.arabicName}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 5: Contact Channels */}
          <div>
            <h4 className="text-xs font-black text-amber-400 uppercase tracking-wider mb-4 border-b border-zinc-800/80 pb-2">
              تواصل معنا
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <a href={`mailto:${BUSINESS_INFO.email}`} className="hover:text-amber-300 font-mono text-[11px]">
                  {BUSINESS_INFO.email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="font-mono text-zinc-300">{BUSINESS_INFO.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-mono text-zinc-300">{BUSINESS_INFO.phoneInternational}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span className="text-zinc-400">{BUSINESS_INFO.location}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-zinc-800/80 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <p>© {new Date().getFullYear()} Distributeur Chips 09. جميع الحقوق محفوظة.</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-zinc-300">
              الشروط والأحكام
            </Link>
            <span>•</span>
            <Link href="/about" className="hover:text-zinc-300">
              سياسة الخصوصية
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
