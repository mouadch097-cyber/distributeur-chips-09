'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { EmptyState } from '@/components/ui/EmptyState';
import { Newspaper, Loader2 } from 'lucide-react';
import { News } from '@/types';

export default function NewsPage() {
  const [newsList, setNewsList] = useState<News[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadNews() {
      try {
        const res = await fetch('/api/news');
        if (res.ok) {
          const data = await res.json();
          setNewsList(data.news || []);
        }
      } catch (e) {
        console.error('Error fetching news:', e);
      } finally {
        setLoading(false);
      }
    }
    loadNews();
  }, []);

  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full text-right">
        <div className="pb-6 mb-8 border-b border-zinc-800">
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-100">
            الأخبار <span className="text-amber-400">والإعلانات</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            آخر المستجدات وتحديثات المخزون ومواعيد التوزيع
          </p>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-amber-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <span className="text-xs text-zinc-400">جاري تحميل الأخبار...</span>
          </div>
        ) : newsList.length === 0 ? (
          <EmptyState
            title="لا توجد أخبار حالياً."
            description="سيتم نشر تحديثات المستودع ومواعيد توزيع الشاحنات في الولايات هنا فور صدورها."
            actionText="العودة للرئيسية"
            actionHref="/"
            icon={<Newspaper className="w-8 h-8" />}
          />
        ) : (
          <div className="space-y-6">
            {newsList.map((item) => (
              <article
                key={item.id}
                className="p-6 rounded-2xl bg-zinc-900/90 border border-zinc-800 space-y-3"
              >
                <div className="flex items-center justify-between text-xs text-zinc-500">
                  <span>
                    {new Date(item.createdAt).toLocaleDateString('ar-DZ', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-zinc-100">{item.arabicTitle || item.title}</h2>
                <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-wrap">
                  {item.arabicContent || item.content}
                </p>
              </article>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
