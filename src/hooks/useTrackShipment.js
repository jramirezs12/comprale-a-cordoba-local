import { useQuery } from '@tanstack/react-query';
import graphqlClient from '../lib/graphqlClient';
import { TRACK_SHIPMENT } from '../graphql/tracking/queries';

export function useTrackShipment(trackNumber, { enabled = false } = {}) {
  const clean = String(trackNumber || '').trim();

  return useQuery({
    queryKey: ['trackShipment', clean],
    enabled: enabled && clean.length > 0,
    queryFn: () => graphqlClient.request(TRACK_SHIPMENT, { trackNumber: clean }),
    retry: 0,
    refetchOnWindowFocus: false,
  });
}