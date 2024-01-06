import { useQuery } from '@tanstack/react-query';

import { countSync } from '@/apis/raise';

export default function useRaiseSyncCount(plan?: API.Plan | null) {
  const queryFn = async () => {
    if (plan?.raising_id) {
      return await countSync(plan.raising_id);
    }
  };

  const { data, isLoading, refetch } = useQuery([plan?.raising_id], queryFn);

  return {
    data,
    isLoading,
    refetch,
  };
}
