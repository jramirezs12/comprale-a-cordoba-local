import { useQuery } from '@tanstack/react-query';
import graphqlClient from '../lib/graphqlClient';
import { ESTIMATE_SHIPPING_METHODS } from '../graphql/sellers/queries';

const DEFAULT_CARRIER_CODE = 'envios';
const DEFAULT_METHOD_CODE = 'inter';

export function useShippingQuote({ cartId, city, street } = {}) {
  const cart = String(cartId || '').trim();
  const cartOk = cart.length > 0;

  const cityName = String(city || '').trim();
  const cityOk = cityName.length > 0;

  const streetArr = Array.isArray(street)
    ? street.map((s) => String(s || '').trim()).filter(Boolean)
    : [String(street || '').trim()].filter(Boolean);

  const streetOk = streetArr.length > 0;

  const enabled = cartOk && cityOk && streetOk;

  return useQuery({
    queryKey: [
      'estimateShippingMethods',
      cart,
      cityName,
      streetArr.join('|'),
      DEFAULT_CARRIER_CODE,
      DEFAULT_METHOD_CODE,
    ],
    enabled,
    queryFn: () =>
      graphqlClient.request(ESTIMATE_SHIPPING_METHODS, {
        cartId: cart,
        carrierCode: DEFAULT_CARRIER_CODE,
        methodCode: DEFAULT_METHOD_CODE,
        city: cityName,
        street: streetArr,
        countryCode: 'CO',
      }),
    staleTime: 0,
    refetchOnWindowFocus: false,
    retry: 1,
  });
}