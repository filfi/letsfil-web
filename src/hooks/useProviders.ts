import { useMemo } from 'react';
import { useRequest } from 'ahooks';

import { providers } from '@/apis/raise';

/**
 * 服务商列表
 * @returns
 */
export default function useProviders() {
  const { data, loading } = useRequest(providers, { retryCount: 3 });

  const list = useMemo(() => data?.list, [data]);

  const getProvider = (id?: number | string) => {
    return list?.find((item) => `${item.id}` === `${id}`);
  };

  const renderLabel = (id?: number | string) => {
    return getProvider(id)?.full_name;
  };

  return {
    list,
    loading,
    getProvider,
    renderLabel,
  };
}
