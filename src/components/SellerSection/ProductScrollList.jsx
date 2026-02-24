import ProductItem from './ProductItem';
import './ProductScrollList.css';

function ProductScrollList({ products, offset = 0, visibleCount = 3, sellerId, sellerName, loading = false }) {
  const visible = products.slice(offset, offset + visibleCount);

  if (loading && (!products || products.length === 0)) {
    return (
      <div className="product-scroll" role="list" aria-label="Productos del negocio">
        {Array.from({ length: visibleCount }).map((_, i) => (
          <div key={i} className="product-item product-item--skeleton" aria-hidden="true" />
        ))}
      </div>
    );
  }

  return (
    <div className="product-scroll" role="list" aria-label="Productos del negocio">
      {visible.map((product) => (
        <ProductItem key={product.id} product={product} sellerId={sellerId} sellerName={sellerName} />
      ))}
    </div>
  );
}

export default ProductScrollList;