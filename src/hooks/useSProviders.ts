import { useQuery } from '@tanstack/react-query';

import { providers } from '@/apis/raise';

/**
 * 服务商列表
 * @returns
 */
export default function useProviders() {
  const { data, isLoading, isError, refetch } = useQuery(['base', 'providers'], providers, {
    staleTime: Infinity,
    select: (d) => d.list,
  });

  const getProvider = (id?: number | string) => {
    return data?.find((item) => `${item.id}` === `${id}`);
  };

  const renderLabel = (id?: number | string) => {
    return getProvider(id)?.full_name;
  };

  return {
    data,
    isError,
    isLoading,
    getProvider,
    renderLabel,
    refetch,
  };
}
