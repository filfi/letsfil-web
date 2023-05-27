import { useMemo } from 'react';

import * as F from '@/utils/format';
import useRaiseRate from '@/hooks/useRaiseRate';
import useRaiseState from '@/hooks/useRaiseState';
import useIncomeRate from '@/hooks/useIncomeRate';
import useDepositInvest from '@/hooks/useDepositInvest';
import { accAdd, accDiv, accMul } from '@/utils/utils';

const SectionRaise: React.FC<{ data?: API.Plan }> = ({ data }) => {
  const { rate } = useIncomeRate(data?.raising_id);
  const { minRate, raiserRate } = useRaiseRate(data);
  const { isStarted, isSuccess } = useRaiseState(data);
  const { progress, target, total } = useDepositInvest(data);

  const minAmount = useMemo(() => accMul(target, minRate), [target, minRate]);
  const opsAmount = useMemo(() => F.toNumber(data?.ops_security_fund), [data?.ops_security_fund]);
  // 运维保证金配比 = 运维保证金 / (运维保证金 + 已募集金额)
  const opsRatio = useMemo(() => (total > 0 ? accDiv(opsAmount, accAdd(total, opsAmount)) : 0), [opsAmount, total]);
  const opsActual = useMemo(() => accMul(opsAmount, opsRatio), [opsAmount, opsRatio]);

  return (
    <>
      <div className="row row-cols-1 row-cols-md-2 g-3 mb-3 mb-lg-4">
        <div className="col">
          <div className="card h-100">
            <div className="card-body">
              <p className="mb-1 text-gray-dark">募集目标</p>
              <p className="mb-0 d-flex align-items-center">
                <span className="fs-5 fw-bold">
                  <span className="fs-3 text-uppercase">{F.formatNum(target, '0.0a')}</span>
                  <span className="ms-1 text-neutral">FIL</span>
                </span>
                <span className="badge badge-success ms-auto">已募{F.formatRate(progress)}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card h-100">
            <div className="card-body">
              <p className="mb-1 text-gray-dark">投资人获得收益</p>
              <p className="mb-0 d-flex flex-wrap align-items-center text-break">
                <span className="fs-5 fw-bold">
                  <span className="fs-3">{raiserRate}</span>
                  <span className="ms-1 text-neutral">%</span>
                </span>
                <a className="badge badge-primary ms-auto" href="#calculator" data-bs-toggle="modal">
                  <span className="bi bi-calculator"></span>
                  <span className="ms-1">年化{F.formatRate(rate, '0.00%')}</span>
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-1 row-cols-xl-2 g-0">
        {isStarted ? (
          <div className="col table-row">
            <div className="row g-0">
              <div className="col-4 table-cell th">募集截止</div>
              <div className="col-8 table-cell">{data ? F.formatUnixDate(data.closing_time) : '-'}</div>
            </div>
          </div>
        ) : (
          <div className="col table-row">
            <div className="row g-0">
              <div className="col-4 table-cell th">募集时间</div>
              <div className="col-8 table-cell">{data ? data.raise_days : '-'}天</div>
            </div>
          </div>
        )}
        <div className="col table-row">
          <div className="row g-0">
            <div className="col-4 table-cell th">最低目标</div>
            <div className="col-8 table-cell">{F.formatAmount(minAmount)} FIL</div>
          </div>
        </div>
        <div className="col table-row">
          <div className="row g-0">
            <div className="col-4 table-cell th">已募集</div>
            <div className="col-8 table-cell">
              <span>{F.formatAmount(total)} FIL</span>
              {isStarted && !isSuccess && <span> · {F.formatRate(progress)}</span>}
            </div>
          </div>
        </div>
        <div className="col table-row">
          <div className="row g-0">
            <div className="col-4 table-cell th">保证金配比</div>
            <div className="col-8 table-cell">{F.formatAmount(opsActual)} FIL</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SectionRaise;
