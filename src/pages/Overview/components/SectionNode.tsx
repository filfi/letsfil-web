import { useMemo } from 'react';

import { SCAN_URL } from '@/constants';
import { formatPower } from '@/utils/format';
import usePackInfo from '@/hooks/usePackInfo';
import useChainInfo from '@/hooks/useChainInfo';
import useRaiseBase from '@/hooks/useRaiseBase';
import useRaiseState from '@/hooks/useRaiseState';
import { accDiv, accMul, accSub, byte2gb } from '@/utils/utils';
import { ReactComponent as NodeIcon } from '@/assets/icons/node-black.svg';

function calcPerPledge(perTera?: number | string) {
  if (perTera && +perTera > 0) {
    return +perTera;
  }
}

const SectionNode: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { perPledge } = useChainInfo();
  const { data: pack } = usePackInfo(data);
  const { actual, target } = useRaiseBase(data);
  const { isSuccess, isWorking } = useRaiseState(data);

  const price = useMemo(() => calcPerPledge(data?.pledge_per_tera_day) ?? perPledge, [perPledge, data?.pledge_per_tera_day]);
  const actualPower = useMemo(() => accMul(accDiv(actual, price), Math.pow(1024, 5)), [price, actual]);
  const targetPower = useMemo(() => accMul(accDiv(target, price), Math.pow(1024, 5)), [price, target]);
  const sealsPower = useMemo(() => accSub(pack?.total_power || 0, 0), [pack?.total_power]);

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
                <div className="col-4 col-lg-5 col-xl-4 table-cell th">建设目标</div>
                <div className="col-8 col-lg-7 col-xl-8 table-cell d-flex">
                  <div className="min-cell mx-auto text-end">
                    <span className="text-decimal me-1">{formatPower(actualPower)?.[0]}</span>
                    <span className="text-neutral small fw-bold">{formatPower(actualPower)?.[1]}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="row g-0 px-2">
                <div className="col-4 col-lg-5 col-xl-4 table-cell th">计划目标</div>
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
              <div className="col-4 col-lg-5 col-xl-4 table-cell th">封装时间</div>
              <div className="col-8 col-lg-7 col-xl-8 table-cell d-flex">
                <div className="min-cell mx-auto text-end">
                  <span className="text-decimal me-1">&lt; {data?.seal_days}</span>
                  <span className="text-neutral small fw-bold">天</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col table-row">
            <div className="row g-0 px-2">
              <div className="col-4 col-lg-5 col-xl-4 table-cell th">扇区大小</div>
              <div className="col-8 col-lg-7 col-xl-8 table-cell d-flex">
                <div className="min-cell mx-auto text-end">
                  <span className="text-decimal me-1">{byte2gb(data?.sector_size)}</span>
                  <span className="text-neutral small fw-bold">GB</span>
                </div>
              </div>
            </div>
          </div>
          <div className="col table-row">
            <div className="row g-0 px-2">
              <div className="col-4 col-lg-5 col-xl-4 table-cell th">扇区时间</div>
              <div className="col-8 col-lg-7 col-xl-8 table-cell d-flex">
                <div className="min-cell mx-auto text-end">
                  <span className="text-decimal me-1">{data?.sector_period}</span>
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
