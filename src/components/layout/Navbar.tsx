'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { useCart } from '@/lib/cart-context';
import { BUSINESS_INFO } from '@/lib/constants';
import {
  ShoppingCart,
  User,
  Search,
  LogOut,
  Phone,
  MessageCircle,
  Menu,
  X,
  Package,
  FileText,
  ShieldCheck,
  ChevronDown,
  Truck,
  Headphones,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { totalCartons } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navLinks = [
    { href: '/', label: 'الرئيسية' },
    { href: '/catalog', label: 'المنتجات' },
    { href: '/offers', label: 'العروض' },
    { href: '/about', label: 'من نحن' },
    { href: '/contact', label: 'اتصل بنا' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#08080a]/95 backdrop-blur-md border-b border-zinc-800/80 text-right">
      {/* Top Announcement & Trust Bar (From Screenshot) */}
      <div className="bg-[#050507] border-b border-zinc-800/60 text-xs py-1.5 px-4 sm:px-8 hidden md:flex items-center justify-between text-zinc-400">
        {/* Left (RTL): Trust Features */}
        <div className="flex items-center gap-6 text-[11px]">
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Headphones className="w-3.5 h-3.5 text-amber-400" />
            <span>خدمة العملاء: 7/7 متوفر</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-300">
            <Truck className="w-3.5 h-3.5 text-amber-400" />
            <span>توصيل سريع في جميع الولايات</span>
          </div>
          <div className="flex items-center gap-1.5 text-zinc-300">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>منتجات أصلية 100% مضمونة</span>
          </div>
        </div>

        {/* Right (RTL): Contact direct */}
        <div className="flex items-center gap-4 text-[11px]">
          <a
            href={BUSINESS_INFO.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-mono"
          >
            <span>{BUSINESS_INFO.phone}</span>
            <MessageCircle className="w-3.5 h-3.5" />
          </a>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-300 font-bold">الموزع المعتمد للشيبس بالجملة</span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-4">
          {/* Left Actions (RTL layout): Cart + Login / Profile */}
          <div className="flex items-center gap-3 order-1 lg:order-1">
            {/* Cart Button with Count Badge */}
            <Link
              href="/cart"
              className="relative flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-amber-400/50 text-zinc-200 transition-all shadow-md group"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                {totalCartons > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-amber-400 text-zinc-950 font-black text-[10px] flex items-center justify-center shadow-md">
                    {totalCartons}
                  </span>
                )}
              </div>
              <span className="text-xs font-bold hidden sm:inline text-zinc-200">السلة</span>
            </Link>

            {/* User Profile or Login Button */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-amber-400/40 hover:border-amber-400 text-zinc-100 text-xs font-bold transition-all"
                >
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="truncate max-w-[100px]">{user.name}</span>
                  <div className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-400 flex items-center justify-center font-black text-[10px]">
                    <User className="w-3.5 h-3.5" />
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute left-0 mt-2 w-52 rounded-2xl bg-zinc-900 border border-zinc-800 shadow-2xl p-2 z-50 text-right space-y-1">
                    <div className="px-3 py-2 border-b border-zinc-800 text-xs">
                      <span className="text-zinc-400 block text-[10px]">مسجل كـ:</span>
                      <span className="font-bold text-amber-400">{user.name}</span>
                    </div>

                    <Link
                      href="/orders"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center justify-end gap-2 px-3 py-2 rounded-xl hover:bg-zinc-800 text-xs text-zinc-200"
                    >
                      <span>طلبياتي</span>
                      <Package className="w-4 h-4 text-amber-400" />
                    </Link>

                    <Link
                      href="/invoices"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center justify-end gap-2 px-3 py-2 rounded-xl hover:bg-zinc-800 text-xs text-zinc-200"
                    >
                      <span>فواتيري</span>
                      <FileText className="w-4 h-4 text-amber-400" />
                    </Link>

                    <Link
                      href="/verification"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center justify-end gap-2 px-3 py-2 rounded-xl hover:bg-zinc-800 text-xs text-zinc-200"
                    >
                      <span>توثيق النشاط التجاري</span>
                      <ShieldCheck className="w-4 h-4 text-amber-400" />
                    </Link>

                    <Link
                      href="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center justify-end gap-2 px-3 py-2 rounded-xl hover:bg-zinc-800 text-xs text-zinc-200"
                    >
                      <span>الملف الشخصي</span>
                      <User className="w-4 h-4 text-amber-400" />
                    </Link>

                    {user.role === 'admin' && (
                      <Link
                        href="/admin/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center justify-end gap-2 px-3 py-2 rounded-xl bg-amber-400/10 text-amber-400 hover:bg-amber-400/20 text-xs font-bold border border-amber-400/20"
                      >
                        <span>لوحة الإدارة</span>
                        <ShieldCheck className="w-4 h-4" />
                      </Link>
                    )}

                    <button
                      onClick={() => {
                        logout();
                        setUserDropdownOpen(false);
                      }}
                      className="w-full flex items-center justify-end gap-2 px-3 py-2 rounded-xl hover:bg-red-950/40 text-xs text-red-400 transition-colors"
                    >
                      <span>تسجيل الخروج</span>
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-xs transition-all shadow-md shadow-amber-500/20">
                  <User className="w-3.5 h-3.5" />
                  <span>تسجيل الدخول</span>
                </button>
              </Link>
            )}

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-400"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

          {/* Center: Search input & Navigation Links */}
          <div className="hidden lg:flex items-center gap-8 order-2">
            {/* Nav links with active underline */}
            <nav className="flex items-center gap-6 text-sm font-bold">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`relative py-2 transition-colors ${
                      isActive ? 'text-amber-400' : 'text-zinc-300 hover:text-amber-400'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 right-0 left-0 h-0.5 bg-amber-400 rounded-full shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right: Authentic Logo Emblem & Brand Text (From Screenshot) */}
          <Link href="/" className="flex items-center gap-3 order-3 group">
            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-black text-zinc-400 tracking-wider block uppercase">
                DISTRIBUTEUR
              </span>
              <span className="text-base font-black text-amber-400 tracking-tight block">
                CHIPS 09
              </span>
            </div>
            <div className="relative w-12 h-12 rounded-full border-2 border-amber-400/80 overflow-hidden shadow-lg shadow-amber-500/20 group-hover:border-amber-400 transition-all bg-black shrink-0">
              <Image
                src="/images/logo.jpg"
                alt="Distributeur Chips 09"
                fill
                className="object-cover"
                priority
              />
            </div>
          </Link>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-800 bg-[#0c0c10] p-4 space-y-3">
          <nav className="flex flex-col space-y-1 text-right">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    isActive
                      ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                      : 'text-zinc-300 hover:bg-zinc-900'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
};
