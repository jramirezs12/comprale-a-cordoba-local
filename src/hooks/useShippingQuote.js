import { useQuery } from '@tanstack/react-query';
import graphqlClient from '../lib/graphqlClient';
import { SHIPPING_QUOTE } from '../graphql/sellers/queries';

export function useShippingQuote({ destinationCityName, productId, qty = 1 } = {}) {
  const cityOk = Boolean(destinationCityName && String(destinationCityName).trim());
  const idNum = Number(productId);
  const idOk = Number.isFinite(idNum) && idNum > 0;
  const qtyNum = Number(qty);
  const qtyOk = Number.isFinite(qtyNum) && qtyNum > 0;

  return useQuery({
    queryKey: ['shippingQuote', destinationCityName || '', idOk ? idNum : 0, qtyOk ? qtyNum : 0],
    enabled: cityOk && idOk && qtyOk,
    queryFn: () =>
      graphqlClient.request(SHIPPING_QUOTE, {
        destinationCityName: String(destinationCityName).trim(),
        productId: idNum,
        qty: qtyNum,
      }),
    retry: 1,
  });
}