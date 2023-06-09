import { useMemo } from 'react';
import useSProviders from './useSProviders';

export default function useSProvider(id?: number | string) {
  const { getProvider } = useSProviders();

  return useMemo(() => getProvider(id), [id, getProvider]);
}
