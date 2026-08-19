import { Product, User } from '@/types';

export interface PriceInfo {
  canViewPrices: boolean;
  effectiveCartonPrice: number | null;
  effectiveUnitPrice: number | null;
  merchantType: 'RETAIL' | 'WHOLESALE' | 'SUPER_WHOLESALE' | null;
  tierLabel: string;
}

/**
 * Resolves whether a user is approved to view prices and calculates their tier-specific price.
 * Strictly enforced server-side.
 */
export function resolveUserPricing(
  product: {
    cartonPrice: number;
    cartonQuantity?: number;
    unitPrice?: number;
    retailPrice?: number | null;
    wholesalePrice?: number | null;
    superWholesalePrice?: number | null;
  },
  user: User | { role?: string; verificationStatus?: string; merchantType?: string | null } | null
): PriceInfo {
  const cartonQty = product.cartonQuantity && product.cartonQuantity > 0 ? product.cartonQuantity : 20;

  // Admin always sees wholesale pricing
  if (user && user.role === 'admin') {
    const effectiveCartonPrice = product.wholesalePrice ?? product.cartonPrice;
    return {
      canViewPrices: true,
      effectiveCartonPrice,
      effectiveUnitPrice: Math.round((effectiveCartonPrice / cartonQty) * 100) / 100,
      merchantType: 'WHOLESALE',
      tierLabel: 'سعر الجملة (مدير النظام)',
    };
  }

  // If unauthenticated or not yet approved by Admin: NO PRICES
  if (!user || user.verificationStatus !== 'APPROVED') {
    return {
      canViewPrices: false,
      effectiveCartonPrice: null,
      effectiveUnitPrice: null,
      merchantType: (user?.merchantType as any) || null,
      tierLabel: 'الأسعار محجوبة (بانتظار التحقق)',
    };
  }

  // Approved users get pricing tailored to their merchantType
  const merchantType = (user.merchantType as 'RETAIL' | 'WHOLESALE' | 'SUPER_WHOLESALE') || 'RETAIL';

  let effectiveCartonPrice: number;
  let tierLabel: string;

  if (merchantType === 'SUPER_WHOLESALE') {
    effectiveCartonPrice = product.superWholesalePrice ?? product.wholesalePrice ?? product.cartonPrice;
    tierLabel = 'سعر سوبر جملة';
  } else if (merchantType === 'WHOLESALE') {
    effectiveCartonPrice = product.wholesalePrice ?? product.cartonPrice;
    tierLabel = 'سعر الجملة';
  } else {
    effectiveCartonPrice = product.retailPrice ?? product.cartonPrice;
    tierLabel = 'سعر التجزئة';
  }

  return {
    canViewPrices: true,
    effectiveCartonPrice,
    effectiveUnitPrice: Math.round((effectiveCartonPrice / cartonQty) * 100) / 100,
    merchantType,
    tierLabel,
  };
}

/**
 * Sanitizes product data for API responses, hiding prices if user is unverified.
 */
export function sanitizeProductForUser(product: any, user: any) {
  const pricing = resolveUserPricing(product, user);

  if (!pricing.canViewPrices) {
    return {
      ...product,
      cartonPrice: 0,
      unitPrice: 0,
      retailPrice: null,
      wholesalePrice: null,
      superWholesalePrice: null,
      priceHidden: true,
      tierLabel: pricing.tierLabel,
    };
  }

  return {
    ...product,
    cartonPrice: pricing.effectiveCartonPrice!,
    unitPrice: pricing.effectiveUnitPrice!,
    priceHidden: false,
    tierLabel: pricing.tierLabel,
    merchantType: pricing.merchantType,
  };
}
