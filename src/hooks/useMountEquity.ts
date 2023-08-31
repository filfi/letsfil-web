import { useQuery } from '@tanstack/react-query';

import { getEquity } from '@/apis/raise';

export default function useMountEquity(plan?: API.Plan | null) {
  const queryFn = async () => {
    if (plan?.raising_id) {
      const res = await getEquity(plan.raising_id, { page_size: 1_000 });
      return res.list;
    }
  };

  const { data, isError, isLoading, refetch } = useQuery(['getRaiseEquity', plan?.raising_id], queryFn);

  return {
    data,
    isError,
    isLoading,
    refetch,
  };
}
