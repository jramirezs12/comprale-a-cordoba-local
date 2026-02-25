import { gql } from 'graphql-request';

export const SELLERS_WITH_PRODUCTS = gql`
  query SellersWithProducts($pageSize: Int, $productLimit: Int, $currentPage: Int) {
    sellersWithProducts(pageSize: $pageSize, productLimit: $productLimit, currentPage: $currentPage) {
      items {
        products {
          items {
            name
            sku
            categories {
              id
              name
            }
            image {
              url
            }
            price_range {
              minimum_price {
                final_price {
                  value
                  currency
                }
              }
            }
          }
        }
        seller {
          banner_pic
          description
          logo_pic
          seller_id
          shop_title
          shop_url
        }
      }
      total_count
      page_info {
        current_page
        is_spellchecked
        page_size
        query_id
        total_pages
      }
    }
  }
`;

export const PRODUCTS_BY_SELLER = gql`
  query ProductsBySeller($sellerId: Int!, $currentPage: Int, $pageSize: Int) {
    productsBySeller(sellerId: $sellerId, currentPage: $currentPage, pageSize: $pageSize) {
      total_count
      page_info {
        current_page
        page_size
        total_pages
      }
      items {
        id
        name
        sku
        stock_saleable
        image {
          url
        }
        description {
          html
        }
        price_range {
          minimum_price {
            final_price {
              value
              currency
            }
          }
        }
      }
    }
  }
`;

export const ESTIMATE_SHIPPING_METHODS = gql`
  mutation EstimateShippingMethods(
    $cartId: String!
    $carrierCode: String!
    $methodCode: String!
    $city: String!
    $street: [String!]!
    $countryCode: CountryCodeEnum!
  ) {
    estimateShippingMethods(
      input: {
        shipping_method: { carrier_code: $carrierCode, method_code: $methodCode }
        cart_id: $cartId
        address: { country_code: $countryCode, street: $street, city: $city }
      }
    ) {
      amount {
        currency
        value
      }
    }
  }
`;