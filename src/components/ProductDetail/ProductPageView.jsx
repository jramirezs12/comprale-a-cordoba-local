'use client';

import { useMemo } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import ProductDetailClient from './ProductDetailClient';
import Navbar from '../Navbar/Navbar';
import Footer from '../Footer/Footer';
import { useProductsBySeller } from '../../hooks/useProductsBySeller';
import { stripHtmlDeep } from '../../utils/html';
import { normSku } from '../../utils/url';
import './ProductPageView.css';

const PRODUCT_PLACEHOLDER = 'https://via.placeholder.com/700x700?text=Producto';

export default function ProductPageView() {
  const params = useParams();
  const searchParams = useSearchParams();

  const rawId = params?.id;
  const sellerId = searchParams?.get('seller');

  const { data, isLoading, isError } = useProductsBySeller({
    sellerId: sellerId ? Number(sellerId) : null,
    pageSize: 200,
    currentPage: 1,
    enabled: Boolean(sellerId),
  });

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
      description: stripHtmlDeep(found.description?.html),
      gallery: found.image?.url ? [found.image.url] : [],
      stock,
    };
  }, [data, rawId]);

  if (!sellerId) {
    return (
      <div className="pdp-page__state-wrapper">
        <Navbar />
        <main className="pdp-page__state-main">
          Producto no encontrado (falta sellerId en la URL).
        </main>
        <Footer sponsors={[]} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="pdp-page__state-wrapper">
        <Navbar />
        <main className="pdp-page__state-main">
          Cargando...
        </main>
        <Footer sponsors={[]} />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="pdp-page__state-wrapper">
        <Navbar />
        <main className="pdp-page__state-main">
          Error cargando el producto.
        </main>
        <Footer sponsors={[]} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pdp-page__state-wrapper">
        <Navbar />
        <main className="pdp-page__state-main">
          Producto no encontrado.
        </main>
        <Footer sponsors={[]} />
      </div>
    );
  }

  return (
    <div className="pdp-page">
      <ProductDetailClient product={product} sellerId={String(sellerId)} />
    </div>
  );
}
