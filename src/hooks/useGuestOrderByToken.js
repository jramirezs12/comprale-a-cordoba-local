import { useQuery } from '@tanstack/react-query';
import graphqlClient from '../lib/graphqlClient';
import { GUEST_ORDER_BY_TOKEN } from '../graphql/orders/queries';

export function useGuestOrderByToken(token, { enabled = false } = {}) {
  const clean = String(token || '').trim();

  return useQuery({
    queryKey: ['guestOrderByToken', clean],
    enabled: enabled && clean.length > 0,
    queryFn: () => graphqlClient.request(GUEST_ORDER_BY_TOKEN, { token: clean }),
    retry: 0,
    refetchOnWindowFocus: false,
  });
}