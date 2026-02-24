'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

function normalizeProduct(p) {
  const product = p || {};
  return {
    ...product,
    // Ensure sku/id always present for routing
    id: product.id ?? product.sku ?? '',
    sku: product.sku ?? product.id ?? '',
    // Ensure numeric productId if present
    productId: typeof product.productId === 'number'
      ? product.productId
      : (typeof product.productId === 'string' && product.productId.trim() ? Number(product.productId) : product.productId) || null,
    stock: typeof product.stock === 'number' ? product.stock : null,
    price: typeof product.price === 'number' ? product.price : Number(product.price || 0),
  };
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('cart');
      const parsed = saved ? JSON.parse(saved) : [];
      // normalize old carts
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

            // Merge product fields so we keep productId/stock if it arrives later
            const mergedProduct = normalizeProduct({ ...i.product, ...incoming });

            // Optional: clamp against stock if available
            const nextQtyRaw = i.quantity + quantity;
            const nextQty =
              typeof mergedProduct.stock === 'number' ? Math.min(nextQtyRaw, mergedProduct.stock) : nextQtyRaw;

            return { ...i, product: mergedProduct, quantity: nextQty };
          })
        : [
            ...prev,
            {
              product: incoming,
              sellerId,
              sellerName,
              quantity:
                typeof incoming.stock === 'number' ? Math.min(quantity, incoming.stock) : quantity,
            },
          ];

      return updated;
    });
  };

  const removeItem = (productId) => {
    const updated = items.filter((i) => i.product.id !== productId);
    saveItems(updated);
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity <= 0) return removeItem(productId);

    const updated = items.map((i) => {
      if (i.product.id !== productId) return i;

      const maxQty = typeof i.product.stock === 'number' ? i.product.stock : null;
      const safeQty = maxQty != null ? Math.min(quantity, maxQty) : quantity;

      return { ...i, quantity: safeQty };
    });

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