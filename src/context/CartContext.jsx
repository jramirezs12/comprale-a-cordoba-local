'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem('cart');
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
    } catch { /* empty */ }
  }, [items]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((v) => !v);

  const addItem = (product, sellerId, quantity = 1, sellerName = '') => {
    setItems((prev) => {
      const id = product?.id ?? product?.sku;
      if (!id) return prev;

      const existing = prev.find((i) => i.product?.id === id);

      const next = existing
        ? prev.map((i) => (i.product?.id === id ? { ...i, quantity: i.quantity + quantity } : i))
        : [...prev, { product: { ...product, id }, sellerId, sellerName, quantity }];

      return next;
    });

    // ✅ requirement: always open "Tu carrito" when adding
    setIsCartOpen(true);
  };

  const updateQuantity = (productId, quantity) => {
    setItems((prev) => {
      if (quantity <= 0) return prev.filter((i) => i.product?.id !== productId);
      return prev.map((i) => (i.product?.id === productId ? { ...i, quantity } : i));
    });
  };

  const removeItem = (productId) => setItems((prev) => prev.filter((i) => i.product?.id !== productId));
  const clearCart = () => setItems([]);

  const total = useMemo(
    () => items.reduce((sum, i) => sum + (Number(i.product?.price) || 0) * (Number(i.quantity) || 0), 0),
    [items]
  );

  const value = {
    items,
    total,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,

    isCartOpen,
    openCart,
    closeCart,
    toggleCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}