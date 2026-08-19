'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, CartItem, Flavor, ProductFlavor } from '@/types';

interface CartContextType {
  items: CartItem[];
  addToCart: (
    product: Product,
    cartonsCount?: number,
    flavor?: Flavor | null,
    productFlavor?: ProductFlavor | null
  ) => void;
  removeFromCart: (productId: string, flavorId?: string | null) => void;
  updateQuantity: (productId: string, cartonsCount: number, flavorId?: string | null) => void;
  clearCart: () => void;
  totalCartons: number;
  totalAmount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'chips09_cart_items_v2';

function getItemKey(productId: string, flavorId?: string | null): string {
  return `${productId}_${flavorId || 'none'}`;
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart to localStorage', e);
      }
    }
  }, [items, isLoaded]);

  const addToCart = (
    product: Product,
    cartonsCount = 1,
    flavor?: Flavor | null,
    productFlavor?: ProductFlavor | null
  ) => {
    const effectiveFlavor = flavor || product.flavor || null;
    const effectiveFlavorId = effectiveFlavor?.id || product.flavorId || null;
    const key = getItemKey(product.id, effectiveFlavorId);

    setItems((prev) => {
      const index = prev.findIndex(
        (item) => getItemKey(item.product.id, item.flavorId || item.flavor?.id || item.product.flavorId) === key
      );

      if (index > -1) {
        const updated = [...prev];
        updated[index] = {
          ...updated[index],
          cartonsCount: updated[index].cartonsCount + cartonsCount,
          flavor: effectiveFlavor || updated[index].flavor,
          flavorId: effectiveFlavorId,
          productFlavor: productFlavor || updated[index].productFlavor,
          productFlavorId: productFlavor?.id || updated[index].productFlavorId,
        };
        return updated;
      }

      return [
        ...prev,
        {
          product,
          cartonsCount,
          flavor: effectiveFlavor,
          flavorId: effectiveFlavorId,
          productFlavor: productFlavor || null,
          productFlavorId: productFlavor?.id || null,
        },
      ];
    });

    setIsCartOpen(true);
  };

  const removeFromCart = (productId: string, flavorId?: string | null) => {
    const targetKey = getItemKey(productId, flavorId);
    setItems((prev) =>
      prev.filter(
        (item) => getItemKey(item.product.id, item.flavorId || item.flavor?.id || item.product.flavorId) !== targetKey
      )
    );
  };

  const updateQuantity = (productId: string, cartonsCount: number, flavorId?: string | null) => {
    if (cartonsCount <= 0) {
      removeFromCart(productId, flavorId);
      return;
    }
    const targetKey = getItemKey(productId, flavorId);
    setItems((prev) =>
      prev.map((item) => {
        const itemKey = getItemKey(item.product.id, item.flavorId || item.flavor?.id || item.product.flavorId);
        return itemKey === targetKey ? { ...item, cartonsCount } : item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalCartons = items.reduce((sum, item) => sum + item.cartonsCount, 0);
  const totalAmount = items.reduce(
    (sum, item) => sum + item.product.cartonPrice * item.cartonsCount,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalCartons,
        totalAmount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
