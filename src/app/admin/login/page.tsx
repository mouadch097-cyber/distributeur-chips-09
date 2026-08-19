'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth-context';
import { ShieldCheck, Lock, AlertCircle, ArrowLeft, Eye } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { refreshUser } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secretCode, setSecretCode] = useState('');
  const [showSecretCode, setShowSecretCode] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, secretCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'بيانات الدخول غير صحيحة.');
      }

      await refreshUser();
      router.push('/admin/dashboard');
    } catch (err: any) {
      setError(err.message || 'فشل تسجيل الدخول للإدارة');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between items-center p-4 sm:p-6">
      <div className="w-full max-w-md my-auto bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 sm:p-10 shadow-2xl text-right">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border-2 border-amber-400/40 flex items-center justify-center text-amber-400 mx-auto mb-4 font-black">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-widest block">
            ADMIN PORTAL
          </span>
          <h1 className="text-2xl font-black text-zinc-100 mt-1">بوابة إدارة النظام</h1>
          <p className="text-xs text-zinc-400 mt-1">Distributeur Chips 09</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="email"
            label="البريد الإلكتروني"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />

          <Input
            type="password"
            label="كلمة المرور"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />

          <div className="relative">
            <Input
              type={showSecretCode ? 'text' : 'password'}
              label="الكود السري"
              placeholder="••••••••"
              value={secretCode}
              onChange={(e) => setSecretCode(e.target.value)}
              required
              autoComplete="off"
            />
            <button
              type="button"
              onClick={() => setShowSecretCode(!showSecretCode)}
              className="absolute left-3 top-[38px] text-zinc-500 hover:text-zinc-300 transition-colors p-1"
              tabIndex={-1}
              aria-label="تبديل إظهار الكود السري"
            >
              <Eye className={`w-4 h-4 ${showSecretCode ? 'text-amber-400' : 'text-zinc-500'}`} />
            </button>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            className="w-full flex items-center justify-center gap-2 mt-4"
          >
            <Lock className="w-4 h-4" />
            <span>دخول لوحة التحكم</span>
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-800 text-center">
          <Link href="/login" className="text-xs text-zinc-500 hover:text-amber-400 transition-colors flex items-center justify-center gap-1">
            <span>العودة لصفحة تسجيل الدخول</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
