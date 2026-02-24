import { gql } from 'graphql-request';

export const CREATE_GUEST_CART = gql`
  mutation CreateGuestCart {
    createEmptyCart
  }
`;

export const DROPSHIPPING_ADD_PRODUCTS_TO_CART = gql`
  mutation DropshippingAddProductsToCart($cartId: String!, $cartItems: [DropshippingCartItemInput!]!) {
    dropshippingAddProductsToCart(cartId: $cartId, cartItems: $cartItems) {
      cart {
        id
        total_quantity
      }
      user_errors {
        code
        message
      }
    }
  }
`;

export const ADD_PRODUCTS_TO_CART = gql`
  mutation AddProductsToCart($cartId: String!, $cartItems: [CartItemInput!]!) {
    addProductsToCart(cartId: $cartId, cartItems: $cartItems) {
      cart {
        id
        total_quantity
      }
      user_errors {
        code
        message
      }
    }
  }
`;

export const SET_GUEST_EMAIL = gql`
  mutation SetGuestEmailOnCart($cartId: String!, $email: String!) {
    setGuestEmailOnCart(input: { cart_id: $cartId, email: $email }) {
      cart {
        email
      }
    }
  }
`;

export const SET_SHIPPING_ADDRESS = gql`
  mutation SetShippingAddress($cartId: String!, $firstname: String!, $lastname: String!, $street: String!, $city: String!, $region: String!, $postcode: String!, $telephone: String!) {
    setShippingAddressesOnCart(
      input: {
        cart_id: $cartId
        shipping_addresses: [{
          address: {
            firstname: $firstname
            lastname: $lastname
            street: [$street]
            city: $city
            region: $region
            postcode: $postcode
            country_code: "CO"
            telephone: $telephone
            save_in_address_book: false
          }
        }]
      }
    ) {
      cart {
        shipping_addresses {
          firstname
          lastname
          available_shipping_methods {
            carrier_code
            method_code
            method_title
            amount {
              value
              currency
            }
          }
        }
      }
    }
  }
`;

export const SET_BILLING_ADDRESS = gql`
  mutation SetBillingAddress($cartId: String!, $firstname: String!, $lastname: String!, $street: String!, $city: String!, $region: String!, $postcode: String!, $telephone: String!) {
    setBillingAddressOnCart(
      input: {
        cart_id: $cartId
        billing_address: {
          address: {
            firstname: $firstname
            lastname: $lastname
            street: [$street]
            city: $city
            region: $region
            postcode: $postcode
            country_code: "CO"
            telephone: $telephone
            save_in_address_book: false
          }
          same_as_shipping: false
        }
      }
    ) {
      cart {
        billing_address {
          firstname
          lastname
        }
      }
    }
  }
`;

export const SET_SHIPPING_METHODS = gql`
  mutation SetShippingMethodsOnCart($cartId: String!, $carrierCode: String!, $methodCode: String!) {
    setShippingMethodsOnCart(
      input: {
        cart_id: $cartId
        shipping_methods: [{
          carrier_code: $carrierCode
          method_code: $methodCode
        }]
      }
    ) {
      cart {
        shipping_addresses {
          selected_shipping_method {
            carrier_code
            method_code
            method_title
            amount {
              value
              currency
            }
          }
        }
      }
    }
  }
`;

export const SET_PAYMENT_METHOD = gql`
  mutation SetPaymentMethod($cartId: String!, $code: String!) {
    setPaymentMethodOnCart(input: { cart_id: $cartId, payment_method: { code: $code } }) {
      cart {
        selected_payment_method {
          code
        }
      }
    }
  }
`;

export const PLACE_ORDER = gql`
  mutation PlaceOrder($cartId: String!) {
    placeOrder(input: { cart_id: $cartId }) {
      order {
        order_number
      }
    }
  }
`;

export const REGISTRATE_PAYMENT = gql`
  mutation RegistratePayment($orderId: String!) {
    registratePayment(order_id: $orderId) {
      url_payment
    }
  }
`;
