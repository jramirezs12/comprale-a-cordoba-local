import { gql } from 'graphql-request';

export const TRACK_SHIPMENT = gql`
  query TrackShipment($trackNumber: String!) {
    trackShipment(trackNumber: $trackNumber) {
      delivery_time
      error_message
      errors
      name_customer
      number_track
      order_date
      shipping_address
      shipping_city
      shipping_phone
      status_name
      status_time
    }
  }
`;