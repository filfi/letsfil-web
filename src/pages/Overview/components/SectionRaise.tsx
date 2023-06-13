import { useMemo } from 'react';

import * as F from '@/utils/format';
import * as U from '@/utils/utils';
import useRaiseBase from '@/hooks/useRaiseBase';
import useRaiseRate from '@/hooks/useRaiseRate';
import useRaiseState from '@/hooks/useRaiseState';
import useIncomeRate from '@/hooks/useIncomeRate';

const SectionRaise: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { rate } = useIncomeRate(data);
  const { isStarted } = useRaiseState(data);
  const { opsRatio, priorityRate } = useRaiseRate(data);
  const { actual, minRate, target, progress } = useRaiseBase(data);

  const minAmount = useMemo(() => U.accMul(target, minRate), [target, minRate]);
  // 实际保证金配比：运维保证金配比 = 运维保证金 / (运维保证金 + 已集合质押金额)
  const opsAmount = useMemo(() => U.accDiv(U.accMul(actual, U.accDiv(opsRatio, 100)), U.accSub(1, U.accDiv(opsRatio, 100))), [actual, opsRatio]);

  return (
    <>
      <div className="row row-cols-1 row-cols-md-2 g-3 mb-3 mb-lg-4">
        <div className="col">
          <div className="card h-100">
            <div className="card-body">
              <p className="mb-1 text-gray-dark">质押目标</p>
              <p className="mb-0 d-flex flex-wrap align-items-center">
                <span className="fs-5 fw-bold">
                  <span className="fs-3 text-uppercase">{F.formatAmount(target)}</span>
                  <span className="ms-1 text-neutral">FIL</span>
                </span>
                <span className="badge badge-success ms-auto">达成{F.formatProgress(progress)}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card h-100">
            <div className="card-body">
              <p className="mb-1 text-gray-dark">建设者获得</p>
              <p className="mb-0 d-flex flex-wrap align-items-center text-break">
                <span className="fs-5 fw-bold">
                  <span className="fs-3">{priorityRate}</span>
                  <span className="ms-1 text-neutral">%</span>
                </span>
                <span className="badge badge-primary ms-auto">预估年化{F.formatRate(rate, '0.00%')}</span>
                {/* <a className="badge badge-primary ms-auto" href="#calculator" data-bs-toggle="modal">
                  <span className="bi bi-calculator"></span>
                  <span className="ms-1">年化{F.formatRate(rate, '0.00%')}</span>
                </a> */}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-1 row-cols-xl-2 g-0">
        {isStarted ? (
          <div className="col table-row">
            <div className="row g-0">
              <div className="col-4 table-cell th">开放截止</div>
              <div className="col-8 table-cell">{data ? F.formatUnixDate(data.closing_time) : '-'}</div>
            </div>
          </div>
        ) : (
          <div className="col table-row">
            <div className="row g-0">
              <div className="col-4 table-cell th">开放时间</div>
              <div className="col-8 table-cell">{data ? data.raise_days : '-'}天</div>
            </div>
          </div>
        )}
        <div className="col table-row">
          <div className="row g-0">
            <div className="col-4 col-xl-5 table-cell th">最低目标</div>
            <div className="col-8 col-xl-7 table-cell">{F.formatAmount(minAmount, 2)} FIL</div>
          </div>
        </div>
        <div className="col table-row">
          <div className="row g-0">
            <div className="col-4 table-cell th">已质押</div>
            <div className="col-8 table-cell">
              <span>{F.formatAmount(actual, 2)} FIL</span>
              {isStarted && <span> · 达成{F.formatProgress(progress)}</span>}
            </div>
          </div>
        </div>
        <div className="col table-row">
          <div className="row g-0">
            <div className="col-4 col-xl-5 table-cell th">保证金配比</div>
            <div className="col-8 col-xl-7 table-cell">{F.formatAmount(opsAmount, 2, 2)} FIL</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SectionRaise;
