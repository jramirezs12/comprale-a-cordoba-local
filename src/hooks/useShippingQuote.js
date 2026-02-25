import { useQuery } from '@tanstack/react-query';
import graphqlClient from '../lib/graphqlClient';
import { SHIPPING_QUOTE } from '../graphql/sellers/queries';

export function useShippingQuote({ destinationCityName, productId, qty = 1 } = {}) {
  const city = String(destinationCityName || '').trim();
  const cityOk = city.length > 0;

  const idNum = Number(productId);
  const idOk = Number.isFinite(idNum) && idNum > 0;

  const qtyNum = Number(qty);
  const qtyOk = Number.isFinite(qtyNum) && qtyNum > 0;

  const queryKey = ['shippingQuote', city, idOk ? idNum : 0, qtyOk ? qtyNum : 0];
  const enabled = cityOk && idOk && qtyOk;

  return useQuery({
    queryKey,
    enabled,
    queryFn: () =>
      graphqlClient.request(SHIPPING_QUOTE, {
        destinationCityName: city,
        productId: idNum,
        qty: qtyNum,
      }),
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}