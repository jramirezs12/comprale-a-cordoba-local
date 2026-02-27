'use client';

import { useEffect, useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import ProductDetailClient from '../../../components/ProductDetail/ProductDetailClient';
import Navbar from '../../../components/Navbar/Navbar';
import Footer from '../../../components/Footer/Footer';
import { useProductsBySeller } from '../../../hooks/useProductsBySeller';

const PRODUCT_PLACEHOLDER = 'https://via.placeholder.com/700x700?text=Producto';

function stripHtml(html) {
  if (!html) return '';
  let text = html.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, ' ');
  text = text.replace(/<[^>]*>/g, ' ');
  text = text.replace(/#[a-zA-Z][\w-]*\s*\[[^\]]*\][^{]*\{[^}]*\}/g, ' ');
  text = text.replace(/[a-zA-Z#.[\]"=\-_]+\s*\{[^}]*\}/g, ' ');
  return text.replace(/\s+/g, ' ').trim();
}

function safeDecodeURIComponent(value) {
  const s = String(value ?? '');

  // If there are stray % not followed by two hex digits, escape them so decode doesn't throw.
  const sanitized = s.replace(/%(?![0-9A-Fa-f]{2})/g, '%25');

  try {
    return decodeURIComponent(sanitized);
  } catch {
    return s;
  }
}

function normSku(value) {
  const s = String(value ?? '');
  const decoded = safeDecodeURIComponent(s);
  return decoded.replace(/\+/g, ' ').replace(/\s+/g, ' ').trim().toLowerCase();
}

export default function ProductDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();

  const rawId = params?.id; // Next returns decoded segment, but we still handle safely
  const sellerId = searchParams?.get('seller');

  const { data, isLoading, isError } = useProductsBySeller({
    sellerId: sellerId ? Number(sellerId) : null,
    pageSize: 200,
    currentPage: 1,
    enabled: Boolean(sellerId),
  });

  useEffect(() => {
    if (!data?.productsBySeller?.items) return;
    // eslint-disable-next-line no-console
    console.log('[PDP] rawId:', rawId, 'normId:', normSku(rawId));
  }, [data, rawId]);

  const product = useMemo(() => {
    const items = data?.productsBySeller?.items;
    if (!Array.isArray(items) || !items.length) return null;

    const target = normSku(rawId);
    const found = items.find((p) => normSku(p?.sku) === target);
    if (!found) return null;

    const stock = typeof found.stock_saleable === 'number' ? found.stock_saleable : null;

    return {
      id: found.sku,
      sku: found.sku,
      productId: typeof found.id === 'number' ? found.id : null,
      name: found.name || '',
      image: found.image?.url || PRODUCT_PLACEHOLDER,
      price: found.price_range?.minimum_price?.final_price?.value ?? 0,
      description: stripHtml(found.description?.html),
      gallery: found.image?.url ? [found.image.url] : [],
      stock,
    };
  }, [data, rawId]);

  if (!sellerId) {
    return (
      <div style={{ background: '#1d1d1f', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ padding: '120px 40px', textAlign: 'center', color: '#efefef' }}>
          Producto no encontrado (falta sellerId en la URL).
        </main>
        <Footer sponsors={[]} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div style={{ background: '#1d1d1f', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ padding: '120px 40px', textAlign: 'center', color: '#efefef' }}>
          Cargando...
        </main>
        <Footer sponsors={[]} />
      </div>
    );
  }

  if (isError) {
    return (
      <div style={{ background: '#1d1d1f', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ padding: '120px 40px', textAlign: 'center', color: '#efefef' }}>
          Error cargando el producto.
        </main>
        <Footer sponsors={[]} />
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ background: '#1d1d1f', minHeight: '100vh' }}>
        <Navbar />
        <main style={{ padding: '120px 40px', textAlign: 'center', color: '#efefef' }}>
          Producto no encontrado.
        </main>
        <Footer sponsors={[]} />
      </div>
    );
  }

  return <ProductDetailClient product={product} sellerId={String(sellerId)} />;
}