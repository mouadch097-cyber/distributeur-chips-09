'use client';

import React from 'react';
import { useAuth } from '@/lib/auth-context';
import { LogOut } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle, action }) => {
  const { user, logout } = useAuth();

  return (
    <header className="w-full bg-zinc-950/60 border-b border-zinc-800/80 px-4 sm:px-6 py-3 sm:py-4 flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0 flex-1">
        <h1 className="text-base sm:text-xl font-black text-zinc-100 truncate">{title}</h1>
        {subtitle && <p className="text-[11px] sm:text-xs text-zinc-400 mt-0.5 line-clamp-1">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-2 sm:gap-4 shrink-0">
        {action && <div className="flex items-center">{action}</div>}

        <div className="hidden sm:block h-6 w-px bg-zinc-800" />

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-bold text-amber-400 block">مدير النظام</span>
            <span className="text-xs text-zinc-300">{user?.name || 'Admin'}</span>
          </div>

          <button
            onClick={logout}
            className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 hover:border-red-500/30 transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center"
            title="تسجيل الخروج"
            aria-label="تسجيل الخروج"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
