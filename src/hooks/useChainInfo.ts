import { useMemo } from 'react';
import { useRequest } from 'ahooks';

import { accMul } from '@/utils/utils';
import { statChainInfo } from '@/apis/raise';

export default function useChainInfo() {
  const { data: info, loading, refresh } = useRequest(statChainInfo, { retryCount: 3 });

  const perPledge = useMemo(() => accMul(info?.pledge_per_tera ?? 0, 1024), [info]);

  return {
    info,
    loading,
    perPledge,
    refresh,
  };
}
