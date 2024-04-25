import { useEffect, useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import { getInfo } from '@/apis/raise';
import { packInfo } from '@/apis/packs';
import { withNull } from '@/utils/hackify';

export default function useAssetData(pid: string | undefined) {
  const getPackInfo = async () => {
    if (pid) {
      return await packInfo(pid);
    }
  };

  const getPlanInfo = async () => {
    if (pid) {
      return await getInfo(pid);
    }
  };

  const [packRes, planRes] = useQueries({
    queries: [
      {
        queryFn: withNull(getPackInfo),
        queryKey: ['getPackInfo', pid],
      },
      {
        queryFn: withNull(getPlanInfo),
        queryKey: ['getPlanInfo', pid],
      },
    ],
  });

  const pack = useMemo(() => packRes.data, [packRes.data]);
  const plan = useMemo(() => planRes.data, [planRes.data]);
  // const isError = useMemo(() => packRes.isError || planRes.isError, [packRes.isError, planRes.isError]);
  // const isLoading = useMemo(() => packRes.isLoading || planRes.isLoading, [packRes.isLoading, planRes.isLoading]);
  const isError = useMemo(() => planRes.isError, [planRes.isError]);
  const isLoading = useMemo(() => planRes.isLoading, [planRes.isLoading]);

  const refetch = () => {
    return Promise.all([packRes.refetch(), planRes.refetch()]);
  };

  useEffect(() => {
    refetch();
  }, [pid]);

  return {
    pack,
    plan,
    isError,
    isLoading,
    refetch,
  };
}
