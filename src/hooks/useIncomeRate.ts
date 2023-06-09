import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { toNumber } from '@/utils/format';
import { withNull } from '@/utils/hackify';
import { getIncomeRate } from '@/apis/raise';
import { accDiv, accMul } from '@/utils/utils';

/**
 * 年化节点激励率
 * @param plan
 * @returns
 */
export default function useIncomeRate(plan?: API.Plan | null) {
  const service = async () => {
    if (plan?.raising_id) {
      return await getIncomeRate(plan.raising_id);
    }
  };

  const { data, isLoading, refetch } = useQuery(['income', plan?.raising_id], withNull(service), {
    staleTime: 60_000,
  });

  const ratio = useMemo(() => plan?.raiser_coin_share ?? 70, [plan?.raiser_coin_share]);
  const income = useMemo(() => toNumber(`${data?.ec_income_rate ?? 0}`, 6), [data?.ec_income_rate]);

  const rate = useMemo(() => {
    const r = accMul(income, accDiv(ratio, 100));
    return Number.isNaN(r) ? 0 : r;
  }, [income, ratio]);

  return {
    rate,
    isLoading,
    refetch,
  };
}
