import { useMemo } from 'react';
import { useRequest } from 'ahooks';

import { toNumber } from '@/utils/format';
import { getContractData } from '@/apis/packs';

export default function usePackData(plan?: API.Plan) {
  const service = async () => {
    if (plan?.raising_id) {
      return await getContractData(plan.raising_id);
    }
  };

  const { data, loading, refresh } = useRequest(service, {
    retryCount: 3,
    refreshDeps: [plan?.raising_id],
  });

  const pledgeTotal = useMemo(() => toNumber(data?.pledge_total_calc_amount ?? plan?.actual_amount), [data?.pledge_total_calc_amount, plan?.actual_amount]);

  return {
    data,
    loading,
    pledgeTotal,
    refresh,
  };
}
