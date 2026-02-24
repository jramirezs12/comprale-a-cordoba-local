import { gql } from 'graphql-request';

export const CREATE_GUEST_CART = gql`
  mutation CreateGuestCart {
    createGuestCart {
      cart {
        id
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
        id
        email
      }
    }
  }
`;

export const SET_SHIPPING_ADDRESS = gql`
  mutation SetShippingAddress(
    $cartId: String!
    $firstname: String!
    $lastname: String!
    $street: String!
    $city: String!
    $regionId: Int!
    $telephone: String!
  ) {
    setShippingAddressesOnCart(
      input: {
        cart_id: $cartId
        shipping_addresses: [
          {
            address: {
              firstname: $firstname
              lastname: $lastname
              street: [$street]
              city: $city
              region_id: $regionId
              country_code: "CO"
              telephone: $telephone
              save_in_address_book: false
            }
          }
        ]
      }
    ) {
      cart {
        id
        shipping_addresses {
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
  mutation SetBillingAddress(
    $cartId: String!
    $firstname: String!
    $lastname: String!
    $street: String!
    $city: String!
    $regionId: Int!
    $telephone: String!
  ) {
    setBillingAddressOnCart(
      input: {
        cart_id: $cartId
        billing_address: {
          address: {
            firstname: $firstname
            lastname: $lastname
            street: [$street]
            city: $city
            region_id: $regionId
            country_code: "CO"
            telephone: $telephone
            save_in_address_book: false
          }
        }
      }
    ) {
      cart {
        id
      }
    }
  }
`;

export const SET_SHIPPING_METHODS = gql`
  mutation SetShippingMethodsOnCart($cartId: String!, $carrierCode: String!, $methodCode: String!) {
    setShippingMethodsOnCart(
      input: { cart_id: $cartId, shipping_methods: { carrier_code: $carrierCode, method_code: $methodCode } }
    ) {
      cart {
        id
      }
    }
  }
`;

export const SET_PAYMENT_METHOD = gql`
  mutation SetPaymentMethodOnCart($cartId: String!, $code: String!) {
    setPaymentMethodOnCart(input: { cart_id: $cartId, payment_method: { code: $code } }) {
      cart {
        id
      }
    }
  }
`;

export const PLACE_ORDER = gql`
  mutation PlaceOrder($cartId: String!) {
    placeOrder(input: { cart_id: $cartId }) {
      errors {
        message
      }
      orderV2 {
        id
        number
      }
    }
  }
`;

export const REGISTRATE_PAYMENT = gql`
  mutation RegistratePayment($orderId: String!) {
    registratePayment(input: { order_id: $orderId }) {
      payment {
        order_amount
        url_payment
        order_id
        uid
        status
      }
    }
  }
`;