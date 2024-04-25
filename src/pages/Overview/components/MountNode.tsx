import { useMemo } from 'react';
import { useModel } from '@umijs/max';

import { SCAN_URL } from '@/constants';
import useMinerInfo from '@/hooks/useMinerInfo';
import useMountState from '@/hooks/useMountState';
import useMountAssets from '@/hooks/useMountAssets';
import useRaiseReward from '@/hooks/useRaiseReward';
import useInvestorCount from '@/hooks/useInvestorCount';
import { formatAmount, formatPower, toNumber } from '@/utils/format';
import { ReactComponent as NodeIcon } from '@/assets/icons/node-black.svg';

const MountNode: React.FC = () => {
  const { plan } = useModel('Overview.overview');
  const { isWorking } = useMountState(plan);

  const { pledge, power } = useMountAssets(plan);
  const { fines, reward } = useRaiseReward(plan);
  const { data: info } = useMinerInfo(plan?.miner_id);
  const { data: counter } = useInvestorCount(plan);

  const balance = useMemo(() => toNumber(info?.total_balance), [info?.total_balance]);

  return (
    <>
      <div className="card">
        <div className="card-header d-flex align-items-center px-3 px-lg-4">
          <div className="d-flex align-items-center">
            <NodeIcon fill="#1D2939" />
            <span className="card-title ms-3 mb-0 fw-600">{plan?.miner_id}</span>
          </div>
          <a className="ms-auto" href={`${SCAN_URL}/address/${plan?.miner_id}`} target="_blank" rel="noreferrer">
            鏈上查看
          </a>
        </div>
        <div className="row row-cols-2 gx-0">
          <div className="col table-row">
            <div className="row g-0 px-2">
              <div className="col-4 col-lg-5 col-xl-4 table-cell th">質押</div>
              <div className="col-8 col-lg-7 col-xl-8 table-cell">
                <span className="text-decimal me-1">{formatAmount(pledge)}</span>
                <span className="text-neutral small fw-bold">FIL</span>
              </div>
            </div>
          </div>
          <div className="col table-row">
            <div className="row g-0 px-2">
              <div className="col-4 col-lg-5 col-xl-4 table-cell th">算力</div>
              <div className="col-8 col-lg-7 col-xl-8 table-cell">
                <span className="text-decimal me-1">{formatPower(power)?.[0]}</span>
                <span className="text-neutral small fw-bold">{formatPower(power)?.[1]}</span>
              </div>
            </div>
          </div>
          <div className="col table-row">
            {isWorking ? (
              <div className="row g-0 px-2">
                <div className="col-4 col-lg-5 col-xl-4 table-cell th">累計激勵</div>
                <div className="col-8 col-lg-7 col-xl-8 table-cell">
                  <span className="text-decimal me-1">{formatAmount(reward, 2)}</span>
                  <span className="text-neutral small fw-bold">FIL</span>
                </div>
              </div>
            ) : (
              <div className="row g-0 px-2">
                <div className="col-4 col-lg-5 col-xl-4 table-cell th">Miner餘額</div>
                <div className="col-8 col-lg-7 col-xl-8 table-cell">
                  <span className="text-decimal me-1">{formatAmount(balance)}</span>
                  <span className="text-neutral small fw-bold">FIL</span>
                </div>
              </div>
            )}
          </div>
          <div className="col table-row">
            <div className="row g-0 px-2">
              <div className="col-4 col-lg-5 col-xl-4 table-cell th">將分配給</div>
              <div className="col-8 col-lg-7 col-xl-8 table-cell">
                <span className="text-decimal me-1">{counter?.investor_count ?? '-'}</span>
                <span className="text-neutral small fw-bold">地址</span>
              </div>
            </div>
          </div>
          {isWorking && (
            <div className="col table-row">
              <div className="row g-0 px-2">
                <div className="col-4 col-lg-5 col-xl-4 table-cell th">累計罰金</div>
                <div className="col-8 col-lg-7 col-xl-8 table-cell">
                  <span className="text-decimal me-1">{formatAmount(fines, 2, 2)}</span>
                  <span className="text-neutral small fw-bold">FIL</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MountNode;
