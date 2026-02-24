'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '../../components/Navbar/Navbar';
import Footer from '../../components/Footer/Footer';
import { useCart } from '../../context/CartContext';
import { sellers as mockSellers, sponsors } from '../../data/mockData';
import ProductItem from '../SellerSection/ProductItem';
import './ProductDetail.css';

const formatPrice = (price) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(price);

export default function ProductDetailClient({ product, sellerId }) {
  const gallery = product.gallery?.length ? product.gallery : [product.image];
  const [activeImg, setActiveImg] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const router = useRouter();
  const { addItem } = useCart();

  const mockSeller = sellerId ? mockSellers.find((s) => String(s.id) === String(sellerId)) : null;
  const sellerName = mockSeller?.name || '';

  // Collect similar products from all sellers (excluding current product), max 6
  const similarItems = [];
  for (const seller of mockSellers) {
    for (const p of seller.products) {
      if (String(p.id) !== String(product.id) && similarItems.length < 6) {
        similarItems.push({ product: p, sellerId: String(seller.id), sellerName: seller.name });
      }
    }
  }

  const handleBuyNow = () => {
    addItem(product, sellerId, quantity, sellerName);
    router.push('/checkout');
  };

  const handleSelectMore = () => {
    addItem(product, sellerId, quantity, sellerName);
    router.push('/');
  };

  return (
    <div className="pdp" style={{ background: '#1d1d1f', minHeight: '100vh' }}>
      <Navbar />
      <main className="pdp__main">
        <div className="pdp__container">

          {/* Title + Price row */}
          <div className="pdp__title-row">
            <h1 className="pdp__title">{product.name}</h1>
            <span className="pdp__price-display">{formatPrice(product.price)}</span>
          </div>

          {/* Main content: image panel + info panel */}
          <div className="pdp__content-row">

            {/* Left: image with thumbnail overlay */}
            <div className="pdp__image-section">
              {gallery.length > 1 && (
                <div className="pdp__thumbnails" role="group" aria-label="Galería de imágenes del producto">
                  {gallery.map((src, i) => (
                    <button
                      key={i}
                      className={`pdp__thumb-btn${activeImg === i ? ' pdp__thumb-btn--active' : ''}`}
                      onClick={() => setActiveImg(i)}
                      aria-label={`Ver imagen ${i + 1} de ${gallery.length}`}
                      aria-pressed={activeImg === i}
                      type="button"
                    >
                      <img src={src} alt="" className="pdp__thumb-img" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              )}
              <div className="pdp__image-card">
                <img
                  className="pdp__main-image"
                  src={gallery[activeImg]}
                  alt={product.name}
                />
              </div>
            </div>

            {/* Right: info panel */}
            <div className="pdp__info-panel">

              {/* Description */}
              <div className="pdp__desc-section">
                <p className="pdp__desc-label">Descripción</p>
                <p className="pdp__desc-text">
                  {product.description || 'Sin descripción disponible.'}
                </p>
              </div>

              {/* Stock */}
              <div className="pdp__stock-row">
                <span className="pdp__stock-label">Unidades disponibles</span>
                <span className="pdp__stock-value">
                  {product.stock != null ? product.stock : '—'}
                </span>
              </div>

              {/* Quantity */}
              <div className="pdp__qty-row">
                <span className="pdp__qty-label">Cantidad</span>
                <div className="pdp__qty-ctrl" role="group" aria-label="Control de cantidad">
                  <button
                    className="pdp__qty-btn"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Reducir cantidad"
                    type="button"
                  >
                    −
                  </button>
                  <span className="pdp__qty-num" aria-live="polite">{quantity}</span>
                  <button
                    className="pdp__qty-btn"
                    onClick={() => setQuantity((q) => q + 1)}
                    aria-label="Aumentar cantidad"
                    type="button"
                  >
                    +
                  </button>
                </div>
              </div>

              <hr className="pdp__divider" />

              {/* Action buttons */}
              <button
                className="pdp__btn pdp__btn--comprar"
                onClick={handleBuyNow}
                aria-label={`Comprar ${product.name}`}
                type="button"
              >
                Comprar
              </button>
              <button
                className="pdp__btn pdp__btn--mas"
                onClick={handleSelectMore}
                aria-label="Agregar al carrito y seleccionar más productos"
                type="button"
              >
                Seleccionar más productos
              </button>

            </div>
          </div>

          {/* Similar items */}
          {similarItems.length > 0 && (
            <section className="pdp__similar" aria-label="Artículos similares">
              <h2 className="pdp__similar-title">Artículos similares</h2>
              <div className="pdp__similar-grid" role="list" aria-label="Productos similares">
                {similarItems.map(({ product: p, sellerId: sid, sellerName: sname }) => (
                  <ProductItem key={p.id} product={p} sellerId={sid} sellerName={sname} />
                ))}
              </div>
            </section>
          )}

        </div>
      </main>
      <Footer sponsors={sponsors} />
    </div>
  );
}

