// import { useDebounceEffect } from 'ahooks';
import { useQuery } from '@tanstack/react-query';

import { getInfo } from '@/apis/raise';
import { withNull } from '@/utils/hackify';

export default function useRaiseDetail(id?: string) {
  const service = async () => {
    if (id) {
      return await getInfo(id);
    }
  };

  const { data, error, isLoading, refetch } = useQuery(['raiseInfo', id], withNull(service), {
    staleTime: 10_000,
  });

  // useDebounceEffect(() => {
  //   id && refetch();
  // }, [id], { wait: 200 });

  return {
    data,
    error,
    isLoading,
    refetch,
  };
}
