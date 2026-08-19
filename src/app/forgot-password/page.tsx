'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { KeyRound, Mail, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء إرسال رمز التحقق');
      }

      // Save email in session storage for the verification step
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('chips09_otp_email', email.trim().toLowerCase());
      }

      // Redirect to OTP verification page
      router.push(`/forgot-password/verify?email=${encodeURIComponent(email.trim().toLowerCase())}`);
    } catch (err: any) {
      setError(err.message || 'فشل إرسال رمز التحقق، يرجى المحاولة لاحقاً.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between selection:bg-amber-400 selection:text-zinc-950">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-10">
        <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 sm:p-9 shadow-2xl text-right">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border-2 border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto mb-4 shadow-lg shadow-amber-500/10">
              <KeyRound className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-zinc-100">نسيت كلمة المرور؟</h1>
            <p className="text-xs text-zinc-400 mt-2">
              أدخل بريدك الإلكتروني وسنرسل لك رمز تحقق (OTP) مكوناً من 6 أرقام.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="email"
              label="البريد الإلكتروني"
              placeholder="example@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={loading}
              className="w-full flex items-center justify-center gap-2"
            >
              <Mail className="w-4 h-4" />
              <span>إرسال رمز التحقق</span>
            </Button>
          </form>

          {/* Security footnote */}
          <div className="mt-6 pt-5 border-t border-zinc-800 text-center">
            <p className="text-[11px] text-zinc-500 flex items-center justify-center gap-1.5 mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>رمز التحقق مشفر وصالح لمدة 10 دقائق فقط</span>
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-xs text-amber-400 hover:text-amber-300 transition-colors"
            >
              <ArrowRight className="w-3.5 h-3.5" />
              <span>العودة لصفحة تسجيل الدخول</span>
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
