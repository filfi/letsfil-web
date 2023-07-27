import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { accMul } from '@/utils/utils';
import { statChainInfo } from '@/apis/raise';
import { toNumber } from '@/utils/format';

export default function useChainInfo() {
  const {
    data: info,
    isLoading,
    refetch,
  } = useQuery(['chaininfo'], statChainInfo, {
    retry: 3,
  });

  const baseFee = useMemo(() => toNumber(info?.base_fee ?? 0, 9), [info?.base_fee]);
  const perFil = useMemo(() => accMul(info?.fil_per_tera ?? 0, 1024), [info?.fil_per_tera]);
  const perPledge = useMemo(() => accMul(info?.pledge_per_tera ?? 0, 1024), [info?.pledge_per_tera]);

  return {
    info,
    baseFee,
    perFil,
    perPledge,
    isLoading,
    refetch,
  };
}
