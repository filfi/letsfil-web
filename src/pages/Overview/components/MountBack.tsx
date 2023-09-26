import { useMemo } from 'react';

import { blocks } from '../constants';
import { accSub } from '@/utils/utils';
import SpinBtn from '@/components/SpinBtn';
import useMountAssets from '@/hooks/useMountAssets';
import { formatAmount, toNumber } from '@/utils/format';
import useReleasedPledge from '@/hooks/useReleasedPledge';
import useDepositInvestor from '@/hooks/useDepositInvestor';

const MountBack: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { released } = useReleasedPledge(data);
  const { investor, investorPledge } = useMountAssets(data);
  const { amount, record, backAmount, unstaking, unStakeAction } = useDepositInvestor(data);

  const withdraw = useMemo(() => Math.max(accSub(record, amount), 0), [amount, record]);
  const backReleased = useMemo(() => {
    const item = blocks.find((i) => i.id === data?.raising_id);

    if (item && released <= toNumber(item.released)) {
      return 0;
    }

    return backAmount;
  }, [data, backAmount, released]);

  if (data && investor && released > 0) {
    return (
      <>
        <div className="card section-card">
          <div className="card-header d-flex gap-3 border-0">
            <h4 className="card-title fw-bold mb-0 me-2">退回质押</h4>

            <span className="badge badge-primary ms-auto">节点已到期</span>
          </div>
          <div className="card-body py-2 fs-16 text-main">
            <p className="d-flex align-items-center gap-3 mb-2">
              <span>我的质押数额</span>
              <span className="ms-auto">
                <span className="fs-20 fw-600">{formatAmount(investorPledge)}</span>
                <span className="ms-1 text-neutral">FIL</span>
              </span>
            </p>
            <p className="d-flex align-items-center gap-3 mb-2">
              <span>已取回质押</span>
              <span className="ms-auto">
                <span className="fs-20 fw-600">{formatAmount(withdraw, 4, 3)}</span>
                <span className="ms-1 text-neutral">FIL</span>
              </span>
            </p>
            <p className="d-flex align-items-center gap-3 mb-2">
              <span>新增可取回质押</span>
              <span className="ms-auto">
                <span className="fs-20 fw-600">{formatAmount(backReleased)}</span>
                <span className="ms-1 text-neutral">FIL</span>
              </span>
            </p>
          </div>
          <div className="card-footer">
            <SpinBtn className="btn btn-primary btn-lg w-100" disabled={backReleased <= 0} loading={unstaking} onClick={unStakeAction}>
              取回质押
            </SpinBtn>
            <p className="mt-3 mb-2 text-gray-dark">扇区分批次到期，质押币逐步释放中</p>
          </div>
        </div>
      </>
    );
  }

  return null;
};

export default MountBack;
