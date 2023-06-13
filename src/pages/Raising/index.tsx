import { filter } from 'lodash';
import { useMemo } from 'react';
import classNames from 'classnames';
import { useRequest, useTitle } from 'ahooks';

import * as A from '@/apis/raise';
import styles from './styles.less';
import Empty from '@/components/Empty';
import BannerCard from './components/BannerCard';
import LoadingView from '@/components/LoadingView';
import RaisingCard from './components/RaisingCard';
import SealingCard from './components/SealingCard';
import WorkingCard from './components/WorkingCard';
import { NodeState, RaiseState } from '@/constants/state';

const isArrs = function <V>(v: V | undefined): v is V {
  return Array.isArray(v) && v.length > 0;
};

function isRaising(data: API.Plan) {
  return data.status === RaiseState.Raising;
}

function isSealing(data: API.Plan) {
  return data.status === RaiseState.Success && [NodeState.WaitingStart, NodeState.PreSeal, NodeState.Started, NodeState.Delayed].includes(data.sealed_status);
}

function isWorking(data: API.Plan) {
  return data.status === RaiseState.Success && data.sealed_status >= NodeState.End && data.sealed_status !== NodeState.PreSeal;
}

export default function Raising() {
  useTitle('节点计划 - FilFi', { restoreOnUnmount: true });

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
  const items = useMemo(() => (banner ? list?.concat(banner) : list), [list, banner]);

  return (
    <div className={classNames('container pt-4 pt-lg-5', styles.container)}>
      <LoadingView data={items} error={!!error} loading={loading} retry={refresh}>
        {isEmpty ? (
          <div className="vh-75 d-flex flex-column justify-content-center">
            <Empty title="没有节点计划" />
          </div>
        ) : (
          <>
            {banner && <BannerCard className={classNames('mb-5', styles.banner)} data={banner} />}

            {isArrs(raises) && (
              <>
                <div className="mb-3 mb-lg-4">
                  <h3 className="mb-1 fs-18 fw-600">正在集合质押</h3>
                </div>
                <div className="row row-cols-1 g-3 g-lg-4 mb-4 mb-lg-5">
                  {raises.map((item) => (
                    <div key={item.raise_address} className={classNames('col', styles.item)}>
                      <RaisingCard data={item} />
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
                      <SealingCard data={item} />
                    </div>
                  ))}
                </div>
              </>
            )}

            {isArrs(workes) && (
              <>
                <div className="mb-3 mb-lg-4">
                  <h3 className="mb-1 fs-18 fw-600">存储运营中</h3>
                  <p className="text-gray-dark">集合质押的FIL完全用于建设联合节点，智能合约按照计划约定持续分配节点激励。</p>
                </div>
                <div className="row row-cols-1 row-cols-lg-2 g-3 g-lg-4">
                  {workes.map((item) => (
                    <div key={item.raising_id} className={classNames('col', styles.item)}>
                      <WorkingCard data={item} />
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
