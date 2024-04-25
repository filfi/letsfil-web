import { useMemo } from 'react';
import { useModel } from '@umijs/max';

import { SCAN_URL } from '@/constants';
import { formatPower } from '@/utils/format';
import useChainInfo from '@/hooks/useChainInfo';
import { accDiv, accMul, accSub, byte2gb } from '@/utils/utils';
import { ReactComponent as NodeIcon } from '@/assets/icons/node-black.svg';

function calcPerPledge(perTera?: number | string, defaultVal = 0) {
  const val = accMul(perTera ?? 0, 1024);

  if (val > 0) {
    return val;
  }

  return defaultVal;
}

function fixNaN(val: number) {
  return Number.isNaN(val) ? 0 : val;
}

const SectionNode: React.FC = () => {
  const { base, plan, pack, state } = useModel('Overview.overview');
  const { perPledge } = useChainInfo();

  const { actual, target } = base;
  const { isSuccess, isWorking } = state;

  const price = useMemo(
    () => calcPerPledge(plan?.pledge_per_tera_day, perPledge),
    [perPledge, plan?.pledge_per_tera_day],
  );
  const actualPower = useMemo(() => fixNaN(accMul(accDiv(actual, price), Math.pow(1024, 5))), [price, actual]);
  const targetPower = useMemo(() => fixNaN(accMul(accDiv(target, price), Math.pow(1024, 5))), [price, target]);
  const sealsPower = useMemo(() => fixNaN(accSub(pack?.total_power || 0, 0)), [pack?.total_power]);

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
            {isWorking ? (
              <div className="row g-0 px-2">
                <div className="col-4 col-lg-5 col-xl-4 table-cell th">有效算力</div>
                <div className="col-8 col-lg-7 col-xl-8 table-cell d-flex">
                  <div className="min-cell mx-auto text-end">
                    <span className="text-decimal me-1">{formatPower(sealsPower)?.[0]}</span>
                    <span className="text-neutral small fw-bold">{formatPower(sealsPower)?.[1]}</span>
                  </div>
                </div>
              </div>
            ) : isSuccess ? (
              <div className="row g-0 px-2">
                <div className="col-4 col-lg-5 col-xl-4 table-cell th">建設目標</div>
                <div className="col-8 col-lg-7 col-xl-8 table-cell d-flex">
                  <div className="min-cell mx-auto text-end">
                    <span className="text-decimal me-1">{formatPower(actualPower)?.[0]}</span>
                    <span className="text-neutral small fw-bold">{formatPower(actualPower)?.[1]}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="row g-0 px-2">
                <div className="col-4 col-lg-5 col-xl-4 table-cell th">計劃目標</div>
                <div className="col-8 col-lg-7 col-xl-8 table-cell d-flex">
                  <div className="min-cell mx-auto text-end">
                    <span className="text-decimal me-1">{formatPower(targetPower)?.[0]}</span>
                    <span className="text-neutral small fw-bold">{formatPower(targetPower)?.[1]}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="col table-row">
            <div className="row g-0 px-2">
              <div className="col-4 col-lg-5 col-xl-4 table-cell th">封裝時間</div>
              <div className="col-8 col-lg-7 col-xl-8 table-cell d-flex">
                <div className="min-cell mx-auto text-end">
                  <span className="text-decimal me-1">&lt; {plan?.seal_days}</span>
                  <span className="text-neutral small fw-bold">天</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col table-row">
            <div className="row g-0 px-2">
              <div className="col-4 col-lg-5 col-xl-4 table-cell th">扇區大小</div>
              <div className="col-8 col-lg-7 col-xl-8 table-cell d-flex">
                <div className="min-cell mx-auto text-end">
                  <span className="text-decimal me-1">{byte2gb(plan?.sector_size)}</span>
                  <span className="text-neutral small fw-bold">GB</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col table-row">
            <div className="row g-0 px-2">
              <div className="col-4 col-lg-5 col-xl-4 table-cell th">扇區時間</div>
              <div className="col-8 col-lg-7 col-xl-8 table-cell d-flex">
                <div className="min-cell mx-auto text-end">
                  <span className="text-decimal me-1">{plan?.sector_period}</span>
                  <span className="text-neutral small fw-bold">天</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SectionNode;
