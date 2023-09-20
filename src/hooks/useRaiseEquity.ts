import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { getEquity } from '@/apis/raise';

const isSponsor = <D extends { role: number }>(data: D) => data.role === 1;
const isInvestor = <D extends { role: number }>(data: D) => data.role === 2;

export default function useRaiseEquity(plan?: API.Plan | null) {
  const queryFn = async () => {
    if (plan?.raising_id) {
      const res = await getEquity(plan.raising_id, { page_size: 1_000 });
      return res.list;
    }
  };

  const { data, isError, isLoading, refetch } = useQuery(['getRaiseEquity', plan?.raising_id], queryFn);

  const sponsors = useMemo(() => data?.filter(isSponsor), [data]);
  const investors = useMemo(() => data?.filter(isInvestor), [data]);

  return {
    data,
    sponsors,
    investors,
    isError,
    isLoading,
    refetch,
  };
}
