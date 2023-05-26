import { useMemo } from 'react';
import { useRequest } from 'ahooks';

import { listPacks } from '@/apis/packs';
import PackCard from './components/PackCard';
import useAccounts from '@/hooks/useAccounts';
import LoadingView from '@/components/LoadingView';

export default function AccountAssets() {
  const { account } = useAccounts();
  const service = async () => {
    if (account) {
      return await listPacks({ address: account, page: 1, page_size: 100 });
    }
  };

  const { data, error, loading, refresh } = useRequest(service, { refreshDeps: [account] });

  const list = useMemo(() => data?.list, [data?.list]);

  return (
    <>
      <LoadingView data={list} error={!!error} loading={loading} retry={refresh}>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3 g-lg-4 my-3">
          {list?.map((item) => (
            <div key={item.asset_pack_id} className="col">
              <PackCard data={item} />
            </div>
          ))}
        </div>
      </LoadingView>
    </>
  );
}
