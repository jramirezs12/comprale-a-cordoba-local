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


export const CREATE_CHECKOUT_PAYMENT = gql`
  mutation CreateCheckoutPayment(
    $cartId: String!
    $email: String!
    $firstname: String!
    $lastname: String!
    $street: String!
    $city: String!
    $regionId: Int!
    $telephone: String!
  ) {
    CreateCheckoutPayment(
      input: {
        cart_id: $cartId
        email: $email
        billing_address: {
          address: {
            firstname: $firstname
            lastname: $lastname
            street: [$street]
            city: $city
            region_id: $regionId
            country_code: "CO"
            telephone: $telephone
          }
        }
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
            }
          }
        ]
      }
    ) {
      payment {
        order_amount
        order_id
        status
        uid
        url_payment
      }
    }
  }
`;