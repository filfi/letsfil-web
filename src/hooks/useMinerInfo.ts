import { useUpdateEffect } from 'ahooks';
import { useQuery } from '@tanstack/react-query';

import { minerInfo } from '@/apis/raise';

export default function useMinerInfo(minerId?: string) {
  const queryFn = async () => {
    if (minerId) {
      return await minerInfo(minerId);
    }
  };

  const { data, isLoading, isError, refetch } = useQuery(['minerInfo', minerId], queryFn);

  useUpdateEffect(() => {
    refetch();
  }, [minerId]);

  return {
    data,
    isError,
    isLoading,
    refetch,
  };
}
