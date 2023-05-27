import { filter } from 'lodash';
import { useMemo } from 'react';
import classNames from 'classnames';
import { useRequest, useTitle } from 'ahooks';

import * as A from '@/apis/raise';
import styles from './styles.less';
import Empty from '@/components/Empty';
import useProvider from '@/hooks/useProvider';
import BannerCard from './components/BannerCard';
import LoadingView from '@/components/LoadingView';
import RaisingCard from './components/RaisingCard';
import SealingCard from './components/SealingCard';
import WorkingCard from './components/WorkingCard';
import { NodeState, RaiseState } from '@/constants/state';

const isArrs = function <V>(v: V | undefined): v is V {
  return Array.isArray(v) && v.length > 0;
};

const isRaising = (data: API.Plan) => data.status === RaiseState.Raising;
const isWorking = (data: API.Plan) => data.status === RaiseState.Success && data.sealed_status === NodeState.End;
const isSealing = (data: API.Plan) => data.status === RaiseState.Success && [NodeState.Started, NodeState.Delayed].includes(data.sealed_status);

export default function Raising() {
  useTitle('募集计划 - FilFi', { restoreOnUnmount: true });

  const { getProvider } = useProvider();

  const service = async () => {
    return await A.list({
      page: 1,
      status: '1,3',
      page_size: 100,
    });
  };

  const { data: banner } = useRequest(A.getBanner);
  const { data, error, loading, refresh } = useRequest(service);
  const list = useMemo(() => data?.list, [data?.list]);
  const raises = useMemo(() => list?.filter(isRaising), [list]);
  const seals = useMemo(() => filter(list, isSealing), [list]);
  const workes = useMemo(() => filter(list, isWorking), [list]);
  const isEmpty = useMemo(() => !((data && data.total > 0) || banner), [banner, data]);

  return (
    <div className="container pt-4 pt-lg-5">
      <LoadingView data={list || banner} error={!!error} loading={loading} retry={refresh}>
        {isEmpty ? (
          <div className="vh-75 d-flex flex-column justify-content-center">
            <Empty title="没有募集计划" />
          </div>
        ) : (
          <>
            {banner && <BannerCard className={classNames('mb-5', styles.banner)} data={banner} getProvider={getProvider} />}

            {isArrs(raises) && (
              <>
                <div className="mb-3 mb-lg-4">
                  <h3 className="mb-1 fs-18 fw-600">开放募集中</h3>
                </div>
                <div className="row row-cols-1 g-3 g-lg-4 mb-4 mb-lg-5">
                  {raises.map((item) => (
                    <div key={item.raise_address} className={classNames('col', styles.item)}>
                      <RaisingCard data={item} getProvider={getProvider} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {isArrs(seals) && (
              <>
                <div className="mb-3 mb-lg-4">
                  <h3 className="mb-1 fs-18 fw-600">正在封装扇区</h3>
                </div>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3 g-lg-4 mb-4 mb-lg-5">
                  {seals.map((item) => (
                    <div key={item.raise_address} className={classNames('col', styles.item)}>
                      <SealingCard data={item} getProvider={getProvider} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {isArrs(workes) && (
              <>
                <div className="mb-3 mb-lg-4">
                  <h3 className="mb-1 fs-18 fw-600">募集成功，已投入生产</h3>
                  <p className="text-gray-dark">募得的FIL做为质押币，完全用于建设联合节点，按照募集计划的约定，智能合约持续分配收益。</p>
                </div>
                <div className="row row-cols-1 row-cols-lg-2 g-3 g-lg-4">
                  {workes.map((item) => (
                    <div key={item.raising_id} className={classNames('col', styles.item)}>
                      <WorkingCard data={item} getProvider={getProvider} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </LoadingView>

      <p>
        <br />
      </p>
      <p>
        <br />
      </p>
    </div>
  );
}
