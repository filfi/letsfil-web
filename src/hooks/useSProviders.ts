import { useQuery } from '@tanstack/react-query';

import { providers } from '@/apis/raise';
import { isEqual } from '@/utils/utils';

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

  const getByAddress = (address?: string) => {
    return data?.find((item) => isEqual(item.wallet_address, address));
  };

  return {
    data,
    isError,
    isLoading,
    getProvider,
    renderLabel,
    getByAddress,
    refetch,
  };
}
