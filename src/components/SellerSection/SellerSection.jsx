'use client';

import SellerCard from './SellerCard';
import './SellerSection.css';

function SellerSection({ sellers, onSellerClick }) {
  return (
    <section className="seller-section" id="negocios" aria-labelledby="seller-section-title">
      <div className="seller-section__inner">
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
