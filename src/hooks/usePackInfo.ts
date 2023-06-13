// import { useDebounceEffect } from 'ahooks';
import { useQuery } from '@tanstack/react-query';

import { packInfo } from '@/apis/packs';
import { withNull } from '@/utils/hackify';
import { isPending } from '@/helpers/raise';

export default function usePackInfo(plan?: API.Plan | null) {
  const service = async () => {
    if (plan?.raising_id && !isPending(plan)) {
      return await packInfo(plan.raising_id);
    }
  };

  const { data, isLoading, refetch } = useQuery(['packInfo', plan?.raising_id], withNull(service), {
    staleTime: 60_000,
  });

  // useDebounceEffect(() => {
  //   data && refetch();
  // }, [data], { wait: 200 });

  return {
    data,
    isLoading,
    refetch,
  };
}
