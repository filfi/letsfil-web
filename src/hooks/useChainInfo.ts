import { useMemo } from 'react';
import { useRequest } from 'ahooks';

import { accMul } from '@/utils/utils';
import { statChainInfo } from '@/apis/raise';

export default function useChainInfo() {
  const { data: info, loading, refresh } = useRequest(statChainInfo, { retryCount: 3 });

  const perFil = useMemo(() => accMul(info?.fil_per_tera ?? 0, 1024), [info?.fil_per_tera]);
  const perPledge = useMemo(() => accMul(info?.pledge_per_tera ?? 0, 1024), [info?.pledge_per_tera]);

  return {
    info,
    loading,
    perFil,
    perPledge,
    refresh,
  };
}
