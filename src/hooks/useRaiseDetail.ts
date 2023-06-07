import { useContext } from 'react';

import { RaiseContext } from '@/components/RaiseProvider/context';

export default function useRaiseDetail() {
  const { data, asset, error, loading, income, info, rate, role, seals, state, provider, refresh, getProvider } = useContext(RaiseContext);

  return {
    data,
    asset,
    error,
    loading,
    income,
    info,
    rate,
    role,
    seals,
    state,
    provider,
    refresh,
    getProvider,
  };
}
