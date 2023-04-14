import { useMemo } from 'react';

import { accDiv, accMul } from '@/utils/utils';
import useDepositInvest from '@/hooks/useDepositInvest';
import { formatAmount, formatNum, toNumber } from '@/utils/format';

function formatPercent(percent: number) {
  return formatNum(percent, '0.0%').replace(/%$/, '');
}

const Assets: React.FC<{ data?: API.Plan }> = ({ data }) => {
  const { amount } = useDepositInvest(data?.raise_address);
  const total = useMemo(() => toNumber(data?.actual_amount), [data]);
  const rate = useMemo(() => accDiv(data?.investor_share ?? 0, 100), [data]);
  const percent = useMemo(() => (total > 0 ? accMul(accDiv(amount, total), rate) : 0), [amount, data, rate]);

  return (
    <>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">我的资产</h5>
          <p className="mb-4">在此计划中的权益</p>

          <div className="row row-cols-2">
            <div className="col">
              <p className="mb-2 fw-500">FIL奖励的权益</p>
              <p className="mb-0 text-main">
                <span className="decimal me-2">{formatPercent(percent)}</span>
                <span className="unit text-neutral">%</span>
              </p>
            </div>
            <div className="col">
              <p className="mb-2 fw-500">质押币的权益</p>
              <p className="mb-0 text-main">
                <span className="decimal me-2">{formatAmount(amount)}</span>
                <span className="unit text-neutral">FIL</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Assets;
