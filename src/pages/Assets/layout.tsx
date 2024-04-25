import { useLayoutEffect } from 'react';
import { Outlet, useModel, useParams } from '@umijs/max';

import LoadingView from '@/components/LoadingView';
import AssetsSider from './components/AssetsSider';
import AssetsHeader from '@/components/AssetsHeader';
import AssetsEvents from './components/AssetsEvents';
import RecordReward from './components/RecordReward';

export default function AssetsLayout() {
  const params = useParams();
  const { plan, isError, isLoading, run, refetch } = useModel('assets.assets');

  useLayoutEffect(() => {
    run(params.id ?? '');
  }, []);

  return (
    <>
      <div className="container">
        <LoadingView data={plan} error={isError} loading={isLoading} retry={refetch}>
          <AssetsHeader data={plan} />

          <div className="row g-3 g-lg-4 mb-5">
            <div className="col-12 col-lg-4">
              <AssetsSider />
            </div>
            <div className="col-12 col-lg-8">
              <Outlet />

              <AssetsEvents />

              <RecordReward />
            </div>
          </div>
        </LoadingView>
      </div>
    </>
  );
}
