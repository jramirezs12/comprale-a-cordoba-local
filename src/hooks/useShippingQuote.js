import { useQuery } from '@tanstack/react-query';
import graphqlClient from '../lib/graphqlClient';
import { SHIPPING_QUOTE } from '../graphql/sellers/queries';

export function useShippingQuote({ destinationCityName, productId, qty = 1 } = {}) {
  return useQuery({
    queryKey: ['shippingQuote', destinationCityName, productId, qty],
    queryFn: () =>
      graphqlClient.request(SHIPPING_QUOTE, { destinationCityName, productId: String(productId), qty }),
    enabled: Boolean(productId),
  });
}
