'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist to localStorage whenever items change
  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
    } catch {
      // ignore storage errors
    }
  }, [items]);

  const saveItems = (newItems) => {
    setItems(newItems);
  };

  const addItem = (product, sellerId, quantity = 1, sellerName = '') => {
    setItems((prev) => {
      const exists = prev.find((i) => i.product.id === product.id);
      const updated = exists
        ? prev.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: i.quantity + quantity }
              : i
          )
        : [...prev, { product, sellerId, sellerName, quantity }];
      return updated;
    });
  };

  const removeItem = (productId) => {
    const updated = items.filter((i) => i.product.id !== productId);
    saveItems(updated);
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) return removeItem(productId);
    const updated = items.map((i) =>
      i.product.id === productId ? { ...i, quantity } : i
    );
    saveItems(updated);
  };

  const clearCart = () => saveItems([]);

  const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
