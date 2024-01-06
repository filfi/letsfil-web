import { useQuery } from '@tanstack/react-query';

import { isStr } from '@/utils/utils';
import { packInfo } from '@/apis/packs';
import { withNull } from '@/utils/hackify';
import { isPending } from '@/helpers/raise';
import { isInactive, isMountPlan } from '@/helpers/mount';

export default function usePackInfo(plan?: API.Plan | string | null) {
  const service = async () => {
    if (isStr(plan)) {
      return await packInfo(plan);
    }

    if (plan && (isMountPlan(plan) ? !isInactive(plan) : !isPending(plan))) {
      return await packInfo(plan.raising_id);
    }
  };

  const { data, error, isLoading, refetch } = useQuery(['packInfo', isStr(plan) ? plan : plan?.raising_id], withNull(service), {
    staleTime: 60_000,
  });

  return {
    data,
    error,
    isLoading,
    refetch,
  };
}
