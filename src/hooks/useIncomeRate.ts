import { useMemo } from 'react';
import { useRequest } from 'ahooks';

import { toNumber } from '@/utils/format';
import { getIncomeRate } from '@/apis/raise';

export default function useIncomeRate(raiseId?: string) {
  const service = async () => {
    if (raiseId) {
      return await getIncomeRate(raiseId);
    }
  };

  const { data, loading, refresh } = useRequest(service, {
    refreshDeps: [raiseId],
    retryCount: 3,
  });
  const rate = useMemo(() => toNumber(data?.ec_income_rate, 6), [data?.ec_income_rate]);

  return {
    rate,
    loading,
    refresh,
  };
}
