'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAuth } from '@/lib/auth-context';
import { Lock, Mail, AlertCircle, ArrowLeft, Loader2, ShieldCheck } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams?.get('redirect') || '/catalog';
  const oauthError = searchParams?.get('error');

  const { refreshUser } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(
    oauthError === 'token_exchange_failed' || oauthError === 'invalid_state' || oauthError === 'oauth_error'
      ? 'تعذر إتمام الدخول عبر Google. يرجى التحقق من الإعدادات أو استخدام البريد وكلمة المرور.'
      : oauthError ? 'حدث خطأ أثناء محاولة تسجيل الدخول.' : ''
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'البريد الإلكتروني أو كلمة المرور غير صحيحة');
      }

      await refreshUser();
      if (data.user?.role === 'admin' && !searchParams?.get('redirect')) {
        router.push('/admin/dashboard');
      } else {
        router.push(redirectPath);
      }
    } catch (err: any) {
      setError(err.message || 'حدث خطأ أثناء تسجيل الدخول');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-right">
      {/* 1. Logo & Title */}
      <div className="text-center mb-7">
        <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto mb-3 font-black text-lg">
          09
        </div>
        <h1 className="text-2xl font-black text-zinc-100">تسجيل الدخول</h1>
        <p className="text-xs text-zinc-400 mt-1">
          مرحباً بك في منصة توزيع الشيبس بالجملة
        </p>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* 2. Email */}
        <Input
          type="email"
          label="البريد الإلكتروني"
          placeholder="example@domain.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />

        {/* 3. Password & Forgot Password */}
        <div>
          <Input
            type="password"
            label="كلمة المرور"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
          <div className="flex justify-start mt-1.5">
            <Link
              href="/forgot-password"
              className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              نسيت كلمة المرور؟
            </Link>
          </div>
        </div>

        {/* 4. Login Button */}
        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={loading}
          className="w-full flex items-center justify-center gap-2 mt-2"
        >
          <span>تسجيل الدخول</span>
          <ArrowLeft className="w-4 h-4" />
        </Button>
      </form>

      {/* Divider */}
      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800"></div>
        </div>
        <span className="relative bg-zinc-900 px-3 text-xs text-zinc-500 font-bold">أو</span>
      </div>

      {/* 5. Google OAuth */}
      <a
        href="/api/auth/google"
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold transition-all shadow-sm"
      >
        <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
          <path
            fill="#EA4335"
            d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
          />
          <path
            fill="#4285F4"
            d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
          />
          <path
            fill="#FBBC05"
            d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.8s.2-2.1.4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
          />
          <path
            fill="#34A853"
            d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
          />
        </svg>
        <span>تسجيل الدخول باستخدام Google</span>
      </a>

      {/* 6. Register link */}
      <div className="mt-5 text-center text-xs text-zinc-400">
        <span>ليس لديك حساب تاجر بعد؟ </span>
        <Link href="/register" className="text-amber-400 font-bold hover:underline">
          إنشاء حساب جديد
        </Link>
      </div>

      {/* 7. Separator & Admin Login Button */}
      <div className="mt-6 pt-5 border-t border-zinc-800/80">
        <Link
          href="/admin/login"
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-zinc-950/60 hover:bg-zinc-800/80 border border-zinc-800 hover:border-amber-400/30 text-zinc-400 hover:text-amber-400 text-xs font-semibold transition-all"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>دخول الإدارة</span>
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-8">
        <Suspense
          fallback={
            <div className="py-12 flex flex-col items-center justify-center text-amber-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <span className="text-xs text-zinc-400">جاري التحميل...</span>
            </div>
          }
        >
          <LoginForm />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
