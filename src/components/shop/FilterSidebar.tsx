'use client';

import React, { useState } from 'react';
import { Search, Filter, RotateCcw, ChevronDown } from 'lucide-react';
import { REAL_BRANDS, REAL_FLAVORS } from '@/lib/constants';

interface FilterSidebarProps {
  search: string;
  setSearch: (val: string) => void;
  selectedBrands: string[];
  toggleBrand: (brandSlug: string) => void;
  selectedFlavors: string[];
  toggleFlavor: (flavorSlug: string) => void;
  inStockOnly: boolean;
  setInStockOnly: (val: boolean) => void;
  resetFilters: () => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  search,
  setSearch,
  selectedBrands,
  toggleBrand,
  selectedFlavors,
  toggleFlavor,
  inStockOnly,
  setInStockOnly,
  resetFilters,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const activeFilterCount =
    selectedBrands.length + selectedFlavors.length + (inStockOnly ? 1 : 0) + (search ? 1 : 0);

  return (
    <aside className="w-full bg-zinc-950/80 border border-zinc-800/80 rounded-2xl text-right">
      {/* Mobile Toggle Header */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-4 text-right"
          aria-expanded={isOpen}
        >
          <div className="flex items-center gap-2">
            <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            {activeFilterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-400 text-zinc-950 text-[10px] font-black flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-black text-zinc-100">تصفية المنتجات</span>
            <Filter className="w-4 h-4 text-amber-400" />
          </div>
        </button>
      </div>

      {/* Filter Content — always visible on lg, collapsible on mobile */}
      <div className={`${isOpen ? 'block' : 'hidden'} lg:block p-5 space-y-6 border-t border-zinc-800 lg:border-t-0`}>
        {/* Header (desktop only) */}
        <div className="hidden lg:flex items-center justify-between pb-4 border-b border-zinc-800">
          <button
            onClick={resetFilters}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-amber-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط</span>
          </button>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-black text-zinc-100">تصفية المنتجات</h3>
            <Filter className="w-4 h-4 text-amber-400" />
          </div>
        </div>

        {/* Mobile Reset */}
        <div className="lg:hidden flex items-center justify-between">
          <button
            onClick={() => { resetFilters(); setIsOpen(false); }}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-amber-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>إعادة ضبط الفلاتر</span>
          </button>
        </div>

        {/* Search Bar */}
        <div>
          <label className="block text-xs font-bold text-zinc-300 mb-2">البحث</label>
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ابحث عن منتج أو نكهة..."
              className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-3" />
          </div>
        </div>

        {/* Brand Filter */}
        <div>
          <h4 className="text-xs font-bold text-zinc-300 mb-3">العلامة التجارية</h4>
          <div className="space-y-2">
            {REAL_BRANDS.map((brand) => {
              const checked = selectedBrands.includes(brand.slug);
              return (
                <label
                  key={brand.slug}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/50 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 cursor-pointer text-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-zinc-200 font-medium">{brand.name}</span>
                    <span className="text-[10px] text-zinc-500">({brand.arabicName})</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleBrand(brand.slug)}
                    className="rounded bg-zinc-950 border-zinc-700 text-amber-500 focus:ring-amber-400 w-4 h-4"
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* Flavor Filter */}
        <div>
          <h4 className="text-xs font-bold text-zinc-300 mb-3">النكهة</h4>
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {REAL_FLAVORS.map((flavor) => {
              const checked = selectedFlavors.includes(flavor.slug);
              return (
                <label
                  key={flavor.slug}
                  className="flex items-center justify-between p-2.5 rounded-lg bg-zinc-900/50 hover:bg-zinc-900 border border-transparent hover:border-zinc-800 cursor-pointer text-xs transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: flavor.color }} />
                    <span className="text-zinc-200 font-medium">{flavor.arabicName}</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleFlavor(flavor.slug)}
                    className="rounded bg-zinc-950 border-zinc-700 text-amber-500 focus:ring-amber-400 w-4 h-4"
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* In-Stock Toggle */}
        <div className="pt-3 border-t border-zinc-800">
          <label className="flex items-center justify-between cursor-pointer py-1">
            <span className="text-xs font-bold text-zinc-300">المنتجات المتوفرة فقط</span>
            <input
              type="checkbox"
              checked={inStockOnly}
              onChange={(e) => setInStockOnly(e.target.checked)}
              className="rounded bg-zinc-950 border-zinc-700 text-amber-500 focus:ring-amber-400 w-4 h-4"
            />
          </label>
        </div>
      </div>
    </aside>
  );
};
