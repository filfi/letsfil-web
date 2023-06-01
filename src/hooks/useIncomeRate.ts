import { useMemo } from 'react';
import { useRequest } from 'ahooks';

import { accMul } from '@/utils/utils';
import { toNumber } from '@/utils/format';
import { getIncomeRate } from '@/apis/raise';

/**
 * 年化收益率
 * @param plan
 * @returns
 */
export default function useIncomeRate(plan?: API.Plan) {
  const service = async () => {
    if (plan?.raising_id) {
      return await getIncomeRate(plan.raising_id);
    }
  };

  const { data, loading, refresh } = useRequest(service, { refreshDeps: [plan?.raising_id] });

  const ratio = useMemo(() => plan?.raiser_coin_share ?? 70, [plan?.raiser_coin_share]);
  const income = useMemo(() => toNumber(`${data?.ec_income_rate ?? 0}`, 6), [data?.ec_income_rate]);

  const rate = useMemo(() => {
    const r = accMul(income, ratio);
    return Number.isNaN(r) ? 0 : r;
  }, [income, ratio]);

  return {
    rate,
    loading,
    refresh,
  };
}
