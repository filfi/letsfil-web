import { useParams } from '@umijs/max';
import { useMemo, useState } from 'react';
import { useDebounceEffect } from 'ahooks';

import usePackInfo from '@/hooks/usePackInfo';
import useRaiseInfo from '@/hooks/useRaiseInfo';
import LoadingView from '@/components/LoadingView';
import AssetsMain from './components/AssetsMain';
import AssetsRole from './components/AssetsRole';
import AssetsSider from './components/AssetsSider';
import AssetsEvents from './components/AssetsEvents';
import AssetsHeader from './components/AssetsHeader';
import AssetsReward from './components/AssetsReward';
import RecordReward from './components/RecordReward';

export default function Assets() {
  const param = useParams();
  const [role, setRole] = useState(-1);

  const { data: pack, error: packErr, isLoading: packLoading, refetch: packRefetch } = usePackInfo(param.id);
  const { data: plan, error: planErr, isLoading: planLoading, refetch: planRefetch } = useRaiseInfo(param.id);

  const hasErr = useMemo(() => !!(packErr || planErr), [planErr, packErr]);
  const isLoading = useMemo(() => planLoading || packLoading, [planLoading, packLoading]);

  const refetch = async () => {
    return await Promise.all([packRefetch(), planRefetch()]);
  };

  useDebounceEffect(
    () => {
      param.id && refetch();
    },
    [param.id],
    { wait: 200 },
  );

  return (
    <>
      <div className="container">
        <LoadingView data={plan} error={hasErr} loading={isLoading} retry={refetch}>
          <AssetsHeader data={plan} />

          <div className="row g-3 g-lg-4">
            <div className="col-12 col-lg-4">
              <AssetsSider pack={pack} plan={plan} />
            </div>
            <div className="col-12 col-lg-8">
              <AssetsRole plan={plan} role={role} onChange={setRole} />

              <AssetsReward plan={plan} role={role} refetch={refetch} />

              <AssetsMain pack={pack} plan={plan} role={role} />

              <AssetsEvents />

              <RecordReward data={plan} />
            </div>
          </div>
        </LoadingView>
      </div>

      <p>
        <br />
      </p>
    </>
  );
}
