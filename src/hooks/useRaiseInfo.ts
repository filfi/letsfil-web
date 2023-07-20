import { useQuery } from '@tanstack/react-query';

import { getInfo } from '@/apis/raise';
import { withNull } from '@/utils/hackify';

export default function useRaiseInfo(id?: string) {
  const service = async () => {
    if (id) {
      return await getInfo(id);
    }
  };

  const { data, error, isLoading, refetch } = useQuery(['raiseInfo', id], withNull(service), {
    staleTime: 30_000,
  });

  return {
    data,
    error,
    isLoading,
    refetch,
  };
}
