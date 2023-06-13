import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { accMul } from '@/utils/utils';
import { statChainInfo } from '@/apis/raise';

export default function useChainInfo() {
  const {
    data: info,
    isLoading,
    refetch,
  } = useQuery(['chaininfo'], statChainInfo, {
    retry: 3,
  });

  const perFil = useMemo(() => accMul(info?.fil_per_tera ?? 0, 1024), [info?.fil_per_tera]);
  const perPledge = useMemo(() => accMul(info?.pledge_per_tera ?? 0, 1024), [info?.pledge_per_tera]);

  return {
    info,
    perFil,
    perPledge,
    isLoading,
    refetch,
  };
}
