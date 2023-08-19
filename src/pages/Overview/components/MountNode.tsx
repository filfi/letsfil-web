import { useMemo } from 'react';

import { SCAN_URL } from '@/constants';
import useMinerInfo from '@/hooks/useMinerInfo';
import useMountState from '@/hooks/useMountState';
import useRaiseReward from '@/hooks/useRaiseReward';
import useInvestorCount from '@/hooks/useInvestorCount';
import { formatAmount, formatPower, toNumber } from '@/utils/format';
import { ReactComponent as NodeIcon } from '@/assets/icons/node-black.svg';

const MountNode: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { isWorking } = useMountState(data);

  const { reward } = useRaiseReward(data);
  const { data: counter } = useInvestorCount(data);
  const { data: info } = useMinerInfo(data?.miner_id);

  const power = useMemo(() => info?.miner_power ?? 0, [info?.miner_power]);
  const pledge = useMemo(() => toNumber(info?.initial_pledge), [info?.initial_pledge]);
  const balance = useMemo(() => toNumber(info?.total_balance), [info?.total_balance]);

  return (
    <>
      <div className="card">
        <div className="card-header d-flex align-items-center px-3 px-lg-4">
          <div className="d-flex align-items-center">
            <NodeIcon fill="#1D2939" />
            <span className="card-title ms-3 mb-0 fw-600">{data?.miner_id}</span>
          </div>
          <a className="ms-auto" href={`${SCAN_URL}/address/${data?.miner_id}`} target="_blank" rel="noreferrer">
            链上查看
          </a>
        </div>
        <div className="row row-cols-2 gx-0">
          <div className="col table-row">
            <div className="row g-0 px-2">
              <div className="col-4 col-lg-5 col-xl-4 table-cell th">质押</div>
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
                <div className="col-4 col-lg-5 col-xl-4 table-cell th">累计激励</div>
                <div className="col-8 col-lg-7 col-xl-8 table-cell">
                  <span className="text-decimal me-1">{formatAmount(reward)}</span>
                  <span className="text-neutral small fw-bold">FIL</span>
                </div>
              </div>
            ) : (
              <div className="row g-0 px-2">
                <div className="col-4 col-lg-5 col-xl-4 table-cell th">Miner余额</div>
                <div className="col-8 col-lg-7 col-xl-8 table-cell">
                  <span className="text-decimal me-1">{formatAmount(balance)}</span>
                  <span className="text-neutral small fw-bold">FIL</span>
                </div>
              </div>
            )}
          </div>
          <div className="col table-row">
            <div className="row g-0 px-2">
              <div className="col-4 col-lg-5 col-xl-4 table-cell th">将分配给</div>
              <div className="col-8 col-lg-7 col-xl-8 table-cell">
                <span className="text-decimal me-1">{counter?.investor_count ?? '-'}</span>
                <span className="text-neutral small fw-bold">地址</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MountNode;
