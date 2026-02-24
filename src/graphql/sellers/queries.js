import { gql } from 'graphql-request';

export const SELLERS_WITH_PRODUCTS = gql`
  query SellersWithProducts($pageSize: Int, $productLimit: Int, $currentPage: Int) {
    sellersWithProducts(pageSize: $pageSize, productLimit: $productLimit, currentPage: $currentPage) {
      items {
        products { items { name sku image { url } price_range { minimum_price { final_price { value currency } } } } }
        seller { banner_pic description logo_pic seller_id shop_title shop_url }
      }
      total_count
      page_info { current_page page_size total_pages }
    }
  }
`;

export const PRODUCTS_BY_SELLER = gql`
  query ProductsBySeller($sellerId: Int!, $currentPage: Int, $pageSize: Int) {
    productsBySeller(sellerId: $sellerId, currentPage: $currentPage, pageSize: $pageSize) {
      total_count
      items { name sku description { html } image { url } price_range { minimum_price { final_price { value currency } } } }
    }
  }
`;

export const SHIPPING_QUOTE = gql`
  query ShippingQuote($destinationCityName: String, $productId: String, $qty: Int) {
    shippingQuote(dataForQuote: { destinationCityName: $destinationCityName productId: $productId qty: $qty }) {
      dateDelivery deliveryDays price
    }
  }
`;
