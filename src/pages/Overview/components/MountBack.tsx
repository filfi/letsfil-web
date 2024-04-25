import { useMemo } from 'react';
import { useModel } from '@umijs/max';

import { blocks } from '../constants';
import { accSub } from '@/utils/utils';
import SpinBtn from '@/components/SpinBtn';
import useMountState from '@/hooks/useMountState';
import useMountAssets from '@/hooks/useMountAssets';
import { formatAmount, toNumber } from '@/utils/format';
import useReleasedPledge from '@/hooks/useReleasedPledge';

const MountBack: React.FC = () => {
  const { assets, plan } = useModel('Overview.overview');

  const { isOver } = useMountState(plan);
  const { released } = useReleasedPledge(plan);
  const { investor, investorPledge } = useMountAssets(plan);
  const { backAmount, investorAmount, investorRecord, investorAction } = assets;

  const withdraw = useMemo(() => Math.max(accSub(investorRecord, investorAmount), 0), [investorAmount, investorRecord]);
  const backReleased = useMemo(() => {
    const item = blocks.find((i) => i.id === plan?.raising_id);

    if (item && released <= toNumber(item.released)) {
      return 0;
    }

    return backAmount ?? 0;
  }, [plan, backAmount, released]);

  if (plan && investor && released > 0) {
    return (
      <>
        <div className="card section-card sticky-card">
          <div className="card-header d-flex gap-3 border-0">
            <h4 className="card-title fw-bold mb-0 me-2">退回質押</h4>

            {isOver && <span className="badge badge-primary ms-auto">節點已到期</span>}
          </div>
          <div className="card-body py-2 fs-16 text-main">
            <p className="d-flex align-items-center gap-3 mb-2">
              <span>我的質押金額</span>
              <span className="ms-auto">
                <span className="fs-20 fw-600">{formatAmount(investorPledge)}</span>
                <span className="ms-1 text-neutral">FIL</span>
              </span>
            </p>
            <p className="d-flex align-items-center gap-3 mb-2">
              <span>已取回質押</span>
              <span className="ms-auto">
                <span className="fs-20 fw-600">{formatAmount(withdraw, 4, 3)}</span>
                <span className="ms-1 text-neutral">FIL</span>
              </span>
            </p>
            <p className="d-flex align-items-center gap-3 mb-2">
              <span>新增可取回質押</span>
              <span className="ms-auto">
                <span className="fs-20 fw-600">{formatAmount(backReleased)}</span>
                <span className="ms-1 text-neutral">FIL</span>
              </span>
            </p>
          </div>
          <div className="card-footer">
            <SpinBtn
              className="btn btn-primary btn-lg w-100"
              disabled={backReleased <= 0}
              loading={investorAction.unstaking}
              onClick={investorAction.unStakeAction}
            >
              取回質押
            </SpinBtn>
            <p className="mt-3 mb-2 text-gray-dark">扇區分批次到期，質押幣逐步釋放中</p>
          </div>
        </div>
      </>
    );
  }

  return null;
};

export default MountBack;
