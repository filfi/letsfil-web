import { useContext } from 'react';

import { RaiseContext } from '@/components/RaiseProvider/context';

export default function useRaiseDetail() {
  const { data, pack, error, loading, income, info, rate, seals, state, provider, refresh, getProvider } = useContext(RaiseContext);

  return {
    data,
    pack,
    error,
    loading,
    income,
    info,
    rate,
    seals,
    state,
    provider,
    refresh,
    getProvider,
  };
}
