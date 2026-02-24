'use client';

import SellerCard from './SellerCard';
import './SellerSection.css';

function SellerSection({ sellers, onSellerClick }) {
  return (
    <section className="seller-section" id="negocios" aria-labelledby="seller-section-title">
      <div className="seller-section__inner">
        <h2 className="seller-section__title" id="seller-section-title">
          Negocios de Córdoba
        </h2>
        {sellers.map((seller) => (
          <SellerCard
            key={seller.id}
            seller={seller}
            onViewDetail={() => onSellerClick && onSellerClick(seller)}
          />
        ))}
      </div>
    </section>
  );
}

export default SellerSection;
