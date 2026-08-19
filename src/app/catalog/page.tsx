'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FilterSidebar } from '@/components/shop/FilterSidebar';
import { ProductCard } from '@/components/shop/ProductCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Product } from '@/types';
import { Loader2 } from 'lucide-react';

function CatalogContent() {
  const searchParams = useSearchParams();
  const initialBrand = searchParams?.get('brand') || '';
  const initialFlavor = searchParams?.get('flavor') || '';

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedBrands, setSelectedBrands] = useState<string[]>(initialBrand ? [initialBrand] : []);
  const [selectedFlavors, setSelectedFlavors] = useState<string[]>(initialFlavor ? [initialFlavor] : []);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          setProducts(data.products || []);
        }
      } catch (e) {
        console.error('Failed to load catalog:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const toggleBrand = (brandSlug: string) => {
    setSelectedBrands((prev) =>
      prev.includes(brandSlug) ? prev.filter((b) => b !== brandSlug) : [...prev, brandSlug]
    );
  };

  const toggleFlavor = (flavorSlug: string) => {
    setSelectedFlavors((prev) =>
      prev.includes(flavorSlug) ? prev.filter((f) => f !== flavorSlug) : [...prev, flavorSlug]
    );
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedBrands([]);
    setSelectedFlavors([]);
    setInStockOnly(false);
    setSortBy('featured');
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        if (search) {
          const query = search.toLowerCase();
          const matchName =
            p.name.toLowerCase().includes(query) || p.arabicName.includes(query);
          const matchBrand = p.brand?.name.toLowerCase().includes(query);
          if (!matchName && !matchBrand) return false;
        }

        if (selectedBrands.length > 0 && (!p.brand?.slug || !selectedBrands.includes(p.brand.slug))) {
          return false;
        }

        if (selectedFlavors.length > 0 && (!p.flavor?.slug || !selectedFlavors.includes(p.flavor.slug))) {
          return false;
        }

        if (inStockOnly && p.stock <= 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.cartonPrice - b.cartonPrice;
        if (sortBy === 'price-desc') return b.cartonPrice - a.cartonPrice;
        if (sortBy === 'name-asc') return a.arabicName.localeCompare(b.arabicName);
        return 0; // default featured/newest
      });
  }, [products, search, selectedBrands, selectedFlavors, inStockOnly, sortBy]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Sidebar Filters */}
      <div className="lg:col-span-3">
        <FilterSidebar
          search={search}
          setSearch={setSearch}
          selectedBrands={selectedBrands}
          toggleBrand={toggleBrand}
          selectedFlavors={selectedFlavors}
          toggleFlavor={toggleFlavor}
          inStockOnly={inStockOnly}
          setInStockOnly={setInStockOnly}
          resetFilters={resetFilters}
        />
      </div>

      {/* Products Grid */}
      <div className="lg:col-span-9 space-y-6">
        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 text-xs">
          <span className="text-zinc-400">
            المنتجات المتاحة: <strong className="text-zinc-100">{filteredProducts.length}</strong>
          </span>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            aria-label="ترتيب المنتجات"
            className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-zinc-300 focus:outline-none focus:border-amber-400"
          >
            <option value="featured">المميز والأحدث</option>
            <option value="price-asc">سعر الكرتون: من الأقل للأعلى</option>
            <option value="price-desc">سعر الكرتون: من الأعلى للأقل</option>
            <option value="name-asc">الاسم أبجدياً</option>
          </select>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-amber-400">
            <Loader2 className="w-8 h-8 animate-spin mb-3" />
            <span className="text-xs text-zinc-400">جاري تحميل المنتجات...</span>
          </div>
        ) : filteredProducts.length === 0 ? (
          <EmptyState
            title="لا توجد منتجات مطابقة للبحث."
            description="يرجى تعديل معايير التصفية أو مسح الفلاتر لعرض باقي أصناف الكتالوج."
            actionText="مسح الفلاتر"
            actionHref="/catalog"
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-[#08080a] text-zinc-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full text-right">
        {/* Page Header */}
        <div className="pb-6 mb-8 border-b border-zinc-800">
          <h1 className="text-2xl sm:text-3xl font-black text-zinc-100">
            كتالوج <span className="text-amber-400">المنتجات والكراتين</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            تسوق كراتين الشيبس بأسعار الجملة لجميع العلامات المعتمدة
          </p>
        </div>

        <Suspense
          fallback={
            <div className="py-24 flex flex-col items-center justify-center text-amber-400">
              <Loader2 className="w-8 h-8 animate-spin mb-3" />
              <span className="text-xs text-zinc-400">جاري تجهيز الكتالوج...</span>
            </div>
          }
        >
          <CatalogContent />
        </Suspense>
      </main>

      <Footer />
    </div>
  );
}
