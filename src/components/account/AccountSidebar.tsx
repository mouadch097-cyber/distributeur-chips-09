'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  User,
  MapPin,
  ClipboardList,
  FileText,
  Heart,
  Bell,
  MessageSquare,
  LogOut,
  HelpCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { BUSINESS_INFO } from '@/lib/constants';

export const AccountSidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const menuItems = [
    { href: '/profile', label: 'الملف الشخصي', icon: User },
    { href: '/addresses', label: 'العناوين', icon: MapPin },
    { href: '/orders', label: 'طلباتي', icon: ClipboardList },
    { href: '/invoices', label: 'فواتيري', icon: FileText },
    { href: '/favorites', label: 'المفضلة', icon: Heart },
    { href: '/notifications', label: 'الإشعارات', icon: Bell },
    { href: '/contact', label: 'تواصل معنا', icon: MessageSquare },
  ];

  return (
    <aside className="w-full lg:w-72 space-y-6 text-right">
      {/* User Info & Navigation Card */}
      <div className="rounded-3xl bg-zinc-900/90 border border-zinc-800/80 p-6 space-y-6 shadow-xl">
        {/* User Header */}
        <div className="flex flex-col items-center text-center space-y-3 pb-6 border-b border-zinc-800">
          <div className="w-16 h-16 rounded-full border-2 border-amber-400/40 bg-zinc-950 flex items-center justify-center text-amber-400">
            <User className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-100">{user?.name || 'تاجر التجزئة'}</h3>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">{user?.email || 'client@email.com'}</p>
          </div>
        </div>

        {/* Menu Items */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all ${
                  isActive
                    ? 'bg-amber-400/10 text-amber-400 border border-amber-400/30'
                    : 'text-zinc-300 hover:bg-zinc-800/60 hover:text-zinc-100'
                }`}
              >
                <span>{item.label}</span>
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`} />
              </Link>
            );
          })}

          {/* Logout button */}
          <button
            onClick={logout}
            className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold text-red-400 hover:bg-red-950/20 transition-all pt-3 border-t border-zinc-800/80 mt-2"
          >
            <span>تسجيل الخروج</span>
            <LogOut className="w-4 h-4 text-red-400" />
          </button>
        </nav>
      </div>

      {/* Support Card */}
      <div className="rounded-3xl bg-zinc-900/60 border border-amber-400/20 p-6 text-center space-y-3">
        <h4 className="text-sm font-bold text-zinc-100">تحتاج مساعدة؟</h4>
        <p className="text-xs text-zinc-400 leading-relaxed">
          فريق الدعم متاح لمساعدتك في أي وقت.
        </p>
        <a
          href={BUSINESS_INFO.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-amber-400/40 text-amber-400 hover:text-amber-300 text-xs font-bold transition-all"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>تواصل معنا</span>
        </a>
      </div>
    </aside>
  );
};
