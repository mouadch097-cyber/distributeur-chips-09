'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Layers,
  Sparkles,
  ShoppingBag,
  Users,
  FileText,
  Truck,
  Boxes,
  Newspaper,
  Tag,
  Settings,
  ShieldCheck,
  ArrowRight,
  Menu,
  X,
} from 'lucide-react';

const ADMIN_LINKS = [
  { href: '/admin/dashboard', label: 'لوحة المؤشرات', icon: LayoutDashboard },
  { href: '/admin/products', label: 'إدارة المنتجات', icon: Package },
  { href: '/admin/brands', label: 'العلامات التجارية', icon: Layers },
  { href: '/admin/flavors', label: 'إدارة النكهات', icon: Sparkles },
  { href: '/admin/orders', label: 'الطلبيات', icon: ShoppingBag },
  { href: '/admin/merchant-verification', label: 'توثيق التجار والسجلات', icon: ShieldCheck },
  { href: '/admin/customers', label: 'الزبائن والتجار', icon: Users },
  { href: '/admin/invoices', label: 'الفواتير', icon: FileText },
  { href: '/admin/drivers', label: 'السائقين والتوزيع', icon: Truck },
  { href: '/admin/inventory', label: 'المخزون والكراتين', icon: Boxes },
  { href: '/admin/news', label: 'الأخبار والإعلانات', icon: Newspaper },
  { href: '/admin/offers', label: 'العروض الترويجية', icon: Tag },
  { href: '/admin/settings', label: 'إعدادات النظام', icon: Settings },
];

const SidebarContent: React.FC<{ onLinkClick?: () => void }> = ({ onLinkClick }) => {
  const pathname = usePathname();
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-zinc-800 flex items-center gap-3 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center font-black text-sm shrink-0">
          09
        </div>
        <div>
          <span className="text-xs text-amber-400 font-bold tracking-wider">لوحة الإدارة</span>
          <h2 className="text-sm font-black text-zinc-100">CHIPS 09 B2B</h2>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {ADMIN_LINKS.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onLinkClick}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-amber-400/10 text-amber-400 border border-amber-400/20'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900'
              }`}
            >
              <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-zinc-400'}`} />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Back to site */}
      <div className="p-3 border-t border-zinc-800 shrink-0">
        <Link
          href="/"
          onClick={onLinkClick}
          className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900 text-xs text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
        >
          <span>العودة للمتجر</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export const AdminSidebar: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile Top Bar (visible on small screens) */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 h-14">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-amber-400 transition-colors"
          aria-label="فتح القائمة"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-amber-400 text-zinc-950 flex items-center justify-center font-black text-xs">
            09
          </div>
          <span className="text-sm font-black text-zinc-100">CHIPS 09 Admin</span>
        </div>
        <div className="w-9" />
      </div>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer Panel */}
      <div
        className={`lg:hidden fixed top-0 right-0 bottom-0 z-50 w-72 bg-zinc-950 border-l border-zinc-800 transition-transform duration-300 ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-4 left-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors"
          aria-label="إغلاق القائمة"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="h-full overflow-y-auto pt-2">
          <SidebarContent onLinkClick={() => setMobileOpen(false)} />
        </div>
      </div>

      {/* Desktop Sidebar (always visible on lg+) */}
      <aside className="hidden lg:flex w-64 bg-zinc-950 border-l border-zinc-800 flex-col h-screen sticky top-0 text-right shrink-0">
        <SidebarContent />
      </aside>
    </>
  );
};
