'use client';

import { use, useMemo } from 'react';
import Navbar from '../../../components/Navbar/Navbar';
import Footer from '../../../components/Footer/Footer';
import { useCategories } from '../../../hooks/useCategories';
import { useProductsByCategory } from '../../../hooks/useProductsByCategory';
import { useInfiniteScrollTrigger } from '../../../hooks/useInfiniteScrollTrigger';
import ProductItem from '../../../components/SellerSection/ProductItem';
import '../../../pages/CategoryPage.css';

function CategoryContent({ id }) {
  const { data: catData } = useCategories();
  const categoryIdNum = Number(id);

  const categoryName = (() => {
    const items = catData?.categories?.items || [];
    for (const parent of items) {
      const children = parent?.children || [];
      const match = children.find((c) => Number(c?.id) === categoryIdNum);
      if (match?.name) return match.name;
    }
    return 'Categoría';
  })();

  const {
    products,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useProductsByCategory({
    categoryId: categoryIdNum,
    pageSize: 50,      // ✅ sellers per page
    productLimit: 50,  // ✅ products per seller
  });

  const canLoadMore = !!hasNextPage && !isFetchingNextPage;

  const sentinelRef = useInfiniteScrollTrigger({
    enabled: canLoadMore && !isLoading && !isError,
    onLoadMore: () => fetchNextPage(),
    rootMargin: '900px',
  });

  const stateText = useMemo(() => {
    if (isLoading) return 'Cargando…';
    if (isError) return 'Error cargando productos.';
    if (products.length === 0) return 'No hay productos en esta categoría.';
    return '';
  }, [isLoading, isError, products.length]);

  return (
    <div className="category-page">
      <Navbar />

      <main className="cat">
        <header className="cat-hero">
          <div className="cat-hero__overlay">
            <div className="cat-hero__inner">
              <h1 className="cat-hero__name">{categoryName}</h1>
              <p className="cat-hero__description">
                Explora productos disponibles en la categoría <strong>{categoryName}</strong>.
              </p>
            </div>
          </div>
        </header>

        <section className="cat-products" aria-labelledby="cat-products-title">
          <div className="cat-products__inner">
            <h2 className="cat-products__title" id="cat-products-title">
              Productos disponibles
            </h2>

            {stateText ? (
              <p className="cat-products__state">{stateText}</p>
            ) : (
              <>
                <div className="cat-products__grid" role="list" aria-label={`Productos de ${categoryName}`}>
                  {products.map((product) => (
                    <ProductItem
                      key={`${product.sellerId}-${product.sku}`}
                      product={product}
                      sellerId={product.sellerId}
                      sellerName={product.sellerName}
                    />
                  ))}
                </div>

                <div ref={sentinelRef} style={{ height: 1 }} />

                {isFetchingNextPage ? <p className="cat-products__state">Cargando más…</p> : null}
                {!hasNextPage && products.length > 0 ? (
                  <p className="cat-products__state"></p>
                ) : null}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer sponsors={[]} />
    </div>
  );
}

export default function CategoryPage({ params }) {
  const { id } = use(params);
  return <CategoryContent id={id} />;
}