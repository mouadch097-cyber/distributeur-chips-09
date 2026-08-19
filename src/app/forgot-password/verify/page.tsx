'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { ShieldCheck, AlertCircle, RotateCcw, Loader2 } from 'lucide-react';

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams?.get('email') || '';

  const [email, setEmail] = useState(emailParam);
  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(45);
  const [resendSuccess, setResendSuccess] = useState('');

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (!email && typeof window !== 'undefined') {
      const storedEmail = sessionStorage.getItem('chips09_otp_email');
      if (storedEmail) setEmail(storedEmail);
    }
  }, [email]);

  // Cooldown countdown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Handle digit inputs
  const handleDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, '').slice(0, 6);
      if (pasted.length > 0) {
        const newDigits = [...digits];
        for (let i = 0; i < 6; i++) {
          newDigits[i] = pasted[i] || '';
        }
        setDigits(newDigits);
        const nextIndex = Math.min(pasted.length, 5);
        inputRefs.current[nextIndex]?.focus();
      }
      return;
    }

    const cleanVal = value.replace(/\D/g, '');
    const newDigits = [...digits];
    newDigits[index] = cleanVal;
    setDigits(newDigits);

    // Auto-advance to next input box
    if (cleanVal && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const otpCode = digits.join('');
    if (otpCode.length !== 6) {
      setError('يرجى إدخال رمز التحقق كاملاً المكون من 6 أرقام.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          otp: otpCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'رمز التحقق غير صحيح أو انتهت صلاحيته.');
      }

      // Store verified reset session token in session storage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('chips09_reset_token', data.resetToken);
      }

      // Redirect to new-password page
      router.push('/forgot-password/new-password');
    } catch (err: any) {
      setError(err.message || 'فشل التحقق من الرمز.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || resending) return;
    setResending(true);
    setError('');
    setResendSuccess('');

    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'تعذر إعادة إرسال الرمز.');
      }

      setResendSuccess('تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني.');
      setResendCooldown(45);
      setDigits(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: any) {
      setError(err.message || 'فشل إعادة الإرسال.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-zinc-900/90 border border-zinc-800 rounded-3xl p-8 sm:p-9 shadow-2xl text-right">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-400/10 border-2 border-amber-400/30 flex items-center justify-center text-amber-400 mx-auto mb-4 shadow-lg shadow-amber-500/10">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-zinc-100">تحقق من بريدك الإلكتروني</h1>
        <p className="text-xs text-zinc-400 mt-2">
          أدخل رمز التحقق المكون من 6 أرقام الذي تم إرساله إلى:
        </p>
        <span className="text-xs font-mono font-bold text-amber-400 block mt-1 truncate">
          {email || 'بريدك الإلكتروني'}
        </span>
      </div>

      {error && (
        <div className="mb-6 p-3.5 rounded-xl bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {resendSuccess && (
        <div className="mb-6 p-3.5 rounded-xl bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs text-center">
          {resendSuccess}
        </div>
      )}

      <form onSubmit={handleVerify} className="space-y-6">
        {/* 6 Digit Input Boxes (LTR for numbers) */}
        <div className="flex items-center justify-center gap-2.5 sm:gap-3 direction-ltr" dir="ltr">
          {digits.map((digit, idx) => (
            <input
              key={idx}
              ref={(el) => {
                inputRefs.current[idx] = el;
              }}
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={digit}
              onChange={(e) => handleDigitChange(idx, e.target.value)}
              onKeyDown={(e) => handleKeyDown(idx, e)}
              className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-black rounded-xl bg-zinc-950 border border-zinc-700 text-amber-400 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 shadow-inner font-mono transition-all"
              autoFocus={idx === 0}
            />
          ))}
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          isLoading={loading}
          className="w-full flex items-center justify-center gap-2"
        >
          <span>تحقق من الرمز</span>
        </Button>
      </form>

      {/* Resend Cooldown Section */}
      <div className="mt-6 pt-5 border-t border-zinc-800 text-center space-y-3">
        <div className="text-xs text-zinc-400">
          {resendCooldown > 0 ? (
            <span>
              إعادة إرسال الرمز بعد{' '}
              <strong className="text-amber-400 font-mono">{resendCooldown}</strong> ثانية
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-amber-400 hover:text-amber-300 font-bold inline-flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className={`w-3.5 h-3.5 ${resending ? 'animate-spin' : ''}`} />
              <span>إعادة إرسال الرمز</span>
            </button>
          )}
        </div>

        <div>
          <Link
            href="/forgot-password"
            className="text-[11px] text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            تغيير البريد الإلكتروني
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between selection:bg-amber-400 selection:text-zinc-950">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-10">
        <Suspense
          fallback={
            <div className="py-12 flex flex-col items-center justify-center text-amber-400">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <span className="text-xs text-zinc-400">جاري التحميل...</span>
            </div>
          }
        >
          <VerifyOtpContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
