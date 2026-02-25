'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

function toNumberOrNull(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : null;
}

function normalizeProduct(p) {
  const product = p || {};
  return {
    ...product,
    // id/sku used for UI and cart uniqueness
    id: product.id ?? product.sku ?? '',
    sku: product.sku ?? product.id ?? '',

    // numeric id required for shippingQuote (Magento product entity id)
    productId: toNumberOrNull(product.productId) ?? toNumberOrNull(product.magentoId) ?? toNumberOrNull(product.entity_id) ?? toNumberOrNull(product.entityId),

    // numeric price
    price: typeof product.price === 'number' ? product.price : Number(product.price || 0),
  };
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('cart');
      const parsed = saved ? JSON.parse(saved) : [];
      return Array.isArray(parsed)
        ? parsed.map((i) => ({ ...i, product: normalizeProduct(i.product) }))
        : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('cart', JSON.stringify(items));
    } catch { /* empty */ }
  }, [items]);

  const saveItems = (newItems) => setItems(newItems);

  const addItem = (product, sellerId, quantity = 1, sellerName = '') => {
    const incoming = normalizeProduct(product);

    setItems((prev) => {
      const exists = prev.find((i) => i.product.id === incoming.id);

      const updated = exists
        ? prev.map((i) => {
            if (i.product.id !== incoming.id) return i;
            // merge, keep productId if it arrives later
            return {
              ...i,
              product: normalizeProduct({ ...i.product, ...incoming }),
              quantity: i.quantity + quantity,
            };
          })
        : [...prev, { product: incoming, sellerId, sellerName, quantity }];

      return updated;
    });
  };

  const removeItem = (productId) => {
    const updated = items.filter((i) => i.product.id !== productId);
    saveItems(updated);
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) return removeItem(productId);
    const updated = items.map((i) => (i.product.id === productId ? { ...i, quantity } : i));
    saveItems(updated);
  };

  const clearCart = () => saveItems([]);

  const total = items.reduce((sum, i) => sum + (i.product.price || 0) * i.quantity, 0);

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