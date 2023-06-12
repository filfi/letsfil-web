import { useMemo } from 'react';
import { useDebounceEffect } from 'ahooks';
import { useQuery } from '@tanstack/react-query';

import { listPacks } from '@/apis/packs';
import { withNull } from '@/utils/hackify';
import useAccount from '@/hooks/useAccount';
import AssetItem from './components/AssetItem';
import LoadingView from '@/components/LoadingView';

export default function AccountAssets() {
  const { address, withAccount } = useAccount();

  const service = withAccount((address) => {
    return listPacks({ address, page: 1, page_size: 100 });
  });

  const { data, error, isLoading, refetch } = useQuery(['listPacks', address], withNull(service));

  const list = useMemo(() => data?.list, [data?.list]);

  useDebounceEffect(
    () => {
      address && refetch();
    },
    [address],
    { wait: 200 },
  );

  return (
    <>
      <LoadingView className="vh-50" data={list} error={!!error} loading={isLoading} retry={refetch}>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3 g-lg-4 my-3">
          {list?.map((item) => (
            <AssetItem key={item.raising_id} data={item} />
          ))}
        </div>
      </LoadingView>
    </>
  );
}
