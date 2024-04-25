import { filter } from 'lodash';
import { useMemo } from 'react';
import classNames from 'classnames';
import { useIntl } from '@umijs/max';
import { useRequest, useTitle } from 'ahooks';

import * as A from '@/apis/raise';
import styles from './styles.less';
import Empty from '@/components/Empty';
import useAccount from '@/hooks/useAccount';
import { filterRaises } from '@/helpers/raise';
import BannerCard from './components/BannerCard';
import LoadingView from '@/components/LoadingView';
import RaisingCard from './components/RaisingCard';
import SealingCard from './components/SealingCard';
import WorkingCard from './components/WorkingCard';
import { NodeState, RaiseState } from '@/constants/state';
import { isMountPlan, isWorking as isMountWorking } from '@/helpers/mount';

const isArrs = function <V>(v: V | undefined): v is V {
  return Array.isArray(v) && v.length > 0;
};

function isRaising(data: API.Plan) {
  return !isMountPlan(data) && data.status === RaiseState.Raising;
}

function isSealing(data: API.Plan) {
  return (
    !isMountPlan(data) &&
    data.status === RaiseState.Success &&
    [NodeState.WaitingStart, NodeState.Started, NodeState.Delayed].includes(data.sealed_status)
  );
}

function isWorking(data: API.Plan) {
  return isMountPlan(data)
    ? isMountWorking(data)
    : data.status === RaiseState.Success && data.sealed_status >= NodeState.End;
}

export default function Raising() {
  const { formatMessage } = useIntl();

  useTitle(`${formatMessage({ id: 'menu.raising' })} - FilFi`, { restoreOnUnmount: true });

  const { address } = useAccount();

  const service = async () => {
    return await A.list({
      page: 1,
      status: '1,3',
      page_size: 100,
    });
  };

  const { data: banner } = useRequest(A.getBanner);
  const { data, error, loading, refresh } = useRequest(service);
  const list = useMemo(() => filterRaises(address)(data?.list), [address, data?.list]);
  const raises = useMemo(() => list?.filter(isRaising), [list]);
  const seals = useMemo(() => filter(list, isSealing), [list]);
  const workes = useMemo(() => filter(list, isWorking), [list]);
  const isEmpty = useMemo(() => !((data && data.total > 0) || banner), [banner, data]);
  const items = useMemo(
    () => (banner?.result ? list?.concat(filterRaises(address)([banner.result])!) : list),
    [address, list, banner],
  );

  return (
    <div className={classNames('container pt-4 pt-lg-5', styles.container)}>
      <LoadingView data={items} error={!!error} loading={loading} retry={refresh}>
        {isEmpty ? (
          <div className="vh-75 d-flex flex-column justify-content-center">
            <Empty title="沒有節點計劃" />
          </div>
        ) : (
          <>
            {banner && (
              <BannerCard
                className={classNames('mb-5', styles.banner)}
                data={banner?.result}
                style={{
                  backgroundImage: banner?.bg_url ? `url(${banner.bg_url})` : undefined,
                }}
              />
            )}

            {isArrs(raises) && (
              <>
                <div className="mb-3 mb-lg-4">
                  <h3 className="mb-1 fs-18 fw-600">正在質押</h3>
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
                  <h3 className="mb-1 fs-18 fw-600">正在封裝</h3>
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
                  <h3 className="mb-1 fs-18 fw-600">正在運行</h3>
                  <p className="text-gray-dark">FilFi智能合約持續分配節點激勵。</p>
                </div>
                <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-3 g-lg-4">
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
