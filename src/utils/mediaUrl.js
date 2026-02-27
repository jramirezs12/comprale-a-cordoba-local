const FROM = 'https://seller.compraleacordoba.com/';
const TO = 'https://www.alcarrito.com/';

export function replaceMediaHost(url) {
  if (!url) return '';
  const s = String(url);

  // Only replace if it starts with the old host
  if (s.startsWith(FROM)) return TO + s.slice(FROM.length);

  return s;
}

export function normalizeSellerMedia(seller) {
  if (!seller) return seller;

  return {
    ...seller,
    banner_pic: replaceMediaHost(seller.banner_pic),
    logo_pic: replaceMediaHost(seller.logo_pic),
  };
}

export function normalizeProductMedia(product) {
  if (!product) return product;

  const next = { ...product };

  if (product.image?.url) {
    next.image = { ...product.image, url: replaceMediaHost(product.image.url) };
  }

  // If any galleries exist elsewhere, keep this as a no-op-safe place to extend later
  if (Array.isArray(product.gallery)) {
    next.gallery = product.gallery.map((u) => replaceMediaHost(u));
  }

  return next;
}

export function normalizeSellersWithProductsResponse(data) {
  const root = data?.sellersWithProducts;
  if (!root) return data;

  const items = Array.isArray(root.items) ? root.items : [];
  const normalizedItems = items.map((it) => {
    const seller = normalizeSellerMedia(it?.seller);

    const products = it?.products;
    const pItems = Array.isArray(products?.items) ? products.items : [];
    const normalizedPItems = pItems.map(normalizeProductMedia);

    return {
      ...it,
      seller,
      products: products
        ? {
            ...products,
            items: normalizedPItems,
          }
        : products,
    };
  });

  return {
    ...data,
    sellersWithProducts: {
      ...root,
      items: normalizedItems,
    },
  };
}

export function normalizeProductsBySellerResponse(data) {
  const root = data?.productsBySeller;
  if (!root) return data;

  const items = Array.isArray(root.items) ? root.items : [];
  const normalizedItems = items.map(normalizeProductMedia);

  return {
    ...data,
    productsBySeller: {
      ...root,
      items: normalizedItems,
    },
  };
}