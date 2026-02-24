'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar/Navbar';
import Hero from '../components/Hero/Hero';
import HowItWorks from '../components/HowItWorks/HowItWorks';
import SellerSection from '../components/SellerSection/SellerSection';
import Stats from '../components/Stats/Stats';
import Footer from '../components/Footer/Footer';
import { sellers as mockSellers, stats, sponsors } from '../data/mockData';
import { useSellersWithProducts } from '../hooks/useSellersWithProducts';
import './home.css';

const SELLER_PLACEHOLDER = 'https://via.placeholder.com/400x300?text=Negocio';
const PRODUCT_PLACEHOLDER = 'https://via.placeholder.com/200x200?text=Producto';

function stripHtml(html) {
  return (html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function mapSellers(items) {
  return (items || []).map((item) => {
    const s = item?.seller || {};

    // IMPORTANT: products.items can be null in the API response
    const productItems = Array.isArray(item?.products?.items) ? item.products.items : [];

    return {
      id: s.seller_id,
      name: s.shop_title || s.shop_url || `Seller ${s.seller_id}`,
      description: stripHtml(s.description),
      image: s.banner_pic || s.logo_pic || SELLER_PLACEHOLDER,
      category: 'Negocio',
      rating: 4.8,
      products: productItems.map((p, i) => ({
        id: p?.sku || `${s.seller_id || 'seller'}-${i}`,
        name: p?.name || '',
        price: p?.price_range?.minimum_price?.final_price?.value ?? 0,
        image: p?.image?.url || PRODUCT_PLACEHOLDER,
      })),
    };
  });
}

export default function HomePage() {
  const howItWorksSectionRef = useRef(null);
  const router = useRouter();

  const q = useSellersWithProducts({ pageSize: 100, productLimit: 6, currentPage: 1 });

  useEffect(() => {
    if (q.isFetching) console.log('[HomePage] sellersWithProducts: fetching...');
  }, [q.isFetching]);

  useEffect(() => {
    if (q.error) console.error('[HomePage] sellersWithProducts ERROR:', q.error);
  }, [q.error]);

  // Better debug: summary + products null/length visibility
  useEffect(() => {
    if (!q.data) return;

    const swp = q.data?.sellersWithProducts;
    const items = swp?.items;

    console.log('[HomePage] swp summary', {
      total_count: swp?.total_count,
      items_type: Array.isArray(items) ? 'array' : typeof items,
      items_length: Array.isArray(items) ? items.length : null,
    });

    if (Array.isArray(items)) {
      const preview = items.slice(0, 10).map((it, idx) => ({
        idx,
        seller_id: it?.seller?.seller_id,
        shop_title: it?.seller?.shop_title,
        shop_url: it?.seller?.shop_url,
        banner_pic: Boolean(it?.seller?.banner_pic),
        logo_pic: Boolean(it?.seller?.logo_pic),
        products_items_type: Array.isArray(it?.products?.items) ? 'array' : typeof it?.products?.items,
        products_len: Array.isArray(it?.products?.items) ? it.products.items.length : null,
      }));

      console.table(preview);
    }
  }, [q.data]);

  const sellers = useMemo(() => {
    const items = q.data?.sellersWithProducts?.items;
    if (Array.isArray(items) && items.length > 0) return mapSellers(items);
    return mockSellers;
  }, [q.data]);

  return (
    <div className="home-page">
      <Navbar />
      <main>
        <Hero nextSectionRef={howItWorksSectionRef} />
        <HowItWorks sectionRef={howItWorksSectionRef} />
        <SellerSection
          sellers={sellers}
          onSellerClick={(seller) => router.push(`/seller/${seller.id}`)}
        />
        <Stats stats={stats} />
        <Footer sponsors={sponsors} />
      </main>
    </div>
  );
}