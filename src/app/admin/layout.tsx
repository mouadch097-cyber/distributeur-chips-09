'use client';

import React from 'react';
import { AdminSidebar } from '@/components/layout/AdminSidebar';
import { useAuth } from '@/lib/auth-context';
import { usePathname, useRouter } from 'next/navigation';
import { ShieldAlert, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Allow /admin/login without layout wrapper
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center text-amber-400">
        <Loader2 className="w-8 h-8 animate-spin mb-2" />
        <span className="text-xs text-zinc-400 mr-2">جاري التحقق من صلاحيات الإدارة...</span>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-[#08080a] flex items-center justify-center p-6 text-right">
        <div className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-3xl p-8 text-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-red-400 mx-auto" />
          <h2 className="text-xl font-black text-zinc-100">صلاحيات الإدارة مطلوبة</h2>
          <p className="text-xs text-zinc-400">
            أنت لا تملك صلاحية الوصول إلى لوحة تحكم الإدارة. يرجى تسجيل الدخول بحساب المدير.
          </p>
          <div className="flex gap-3 pt-2">
            <Link href="/admin/login" className="flex-1">
              <Button variant="primary" size="md" className="w-full">
                تسجيل دخول المدير
              </Button>
            </Link>
            <Link href="/" className="flex-1">
              <Button variant="outline" size="md" className="w-full">
                المتجر
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-row">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto max-h-screen pt-14 lg:pt-0">
        {children}
      </div>
    </div>
  );
}
