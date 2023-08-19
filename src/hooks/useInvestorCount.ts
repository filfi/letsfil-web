import { useUpdateEffect } from 'ahooks';
import { useQuery } from '@tanstack/react-query';

import { count } from '@/apis/raise';
import { isWorking } from '@/helpers/raise';
import { isMountPlan } from '@/helpers/mount';

export default function useInvestorCount(plan?: API.Plan | null) {
  const queryFn = async () => {
    if (plan && (isMountPlan(plan) || isWorking(plan))) {
      return await count(plan.raising_id);
    }
  };

  const { data, isLoading, isError, refetch } = useQuery(['investorCounter', plan?.raising_id], queryFn);

  useUpdateEffect(() => {
    refetch();
  }, [plan?.raising_id]);

  return {
    data,
    isError,
    isLoading,
    refetch,
  };
}
