import { useMemo } from 'react';

import * as F from '@/utils/format';
import { accDiv, accMul } from '@/utils/utils';
import useRaiseState from '@/hooks/useRaiseState';
import useDepositInvest from '@/hooks/useDepositInvest';

function formatIncome(rate?: number | string) {
  return F.formatPercent(rate).replace(/%$/, '');
}

const SectionRaise: React.FC<{ data?: API.Plan }> = ({ data }) => {
  const { percent, totalPledge } = useDepositInvest(data);
  const { isStarted, isSuccess } = useRaiseState(data);

  const total = useMemo(() => F.toNumber(data?.target_amount), [data]);
  const minAmount = useMemo(() => accMul(total, accDiv(data?.min_raise_rate ?? 0, 100)), [total, data?.min_raise_rate]);
  const opsAmount = useMemo(() => (data ? accMul(total, accDiv(data.ops_security_fund_rate, 100)) : 0), [total, data?.ops_security_fund_rate]);

  return (
    <>
      <div className="row row-cols-1 row-cols-md-2 g-3 mb-3 mb-lg-4">
        <div className="col">
          <div className="card h-100">
            <div className="card-body">
              <p className="mb-1 text-gray-dark">募集目标</p>
              <p className="mb-0 d-flex align-items-center">
                <span className="fs-5 fw-bold">
                  <span className="fs-3 text-uppercase">{F.formatNum(total, '0.0a')}</span>
                  <span className="ms-1 text-neutral">FIL</span>
                </span>
                <span className="badge badge-success ms-auto">已募{F.formatRate(percent)}</span>
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
                  <span className="fs-3">{formatIncome(data?.income_rate || 0)}</span>
                  <span className="ms-1 text-neutral">%</span>
                </span>
                {/* <span className="badge badge-primary ms-auto">
                  {isRaiser ? data?.raiser_share : isProvider ? data?.servicer_share : data?.investor_share}% · 年化
                </span> */}
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
              <span>{F.formatAmount(totalPledge)} FIL</span>
              {isStarted && !isSuccess && <span> · {F.formatRate(percent)}</span>}
            </div>
          </div>
        </div>
        <div className="col table-row">
          <div className="row g-0">
            <div className="col-4 table-cell th">保证金配比</div>
            <div className="col-8 table-cell">{F.formatAmount(opsAmount)} FIL</div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SectionRaise;
