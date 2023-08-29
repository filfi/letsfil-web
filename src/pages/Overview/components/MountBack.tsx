import SpinBtn from '@/components/SpinBtn';
import { formatAmount } from '@/utils/format';
import useMountAssets from '@/hooks/useMountAssets';
import useReleasedPledge from '@/hooks/useReleasedPledge';
import useDepositInvestor from '@/hooks/useDepositInvestor';

const MountBack: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { released } = useReleasedPledge(data);
  const { investor, investorPledge } = useMountAssets(data);
  const { backAmount, unstaking, unStakeAction } = useDepositInvestor(data);

  if (investor && released > 0) {
    return (
      <>
        <div className="card section-card">
          <div className="card-header d-flex gap-3 border-0">
            <h4 className="card-title fw-bold mb-0 me-2">退回质押</h4>

            <span className="badge badge-primary ms-auto">节点已到期</span>
          </div>
          <div className="card-body py-2 fs-16 text-main">
            <p className="d-flex align-items-center gap-3 mb-2">
              <span>质押数额</span>
              <span className="ms-auto">
                <span className="fs-20 fw-600">{formatAmount(investorPledge)}</span>
                <span className="ms-1 text-neutral">FIL</span>
              </span>
            </p>
            <p className="d-flex align-items-center gap-3 mb-2">
              <span>退回质押</span>
              <span className="ms-auto">
                <span className="fs-20 fw-600">{formatAmount(backAmount)}</span>
                <span className="ms-1 text-neutral">FIL</span>
              </span>
            </p>
          </div>
          <div className="card-footer">
            <SpinBtn className="btn btn-primary btn-lg w-100" disabled={backAmount <= 0} loading={unstaking} onClick={unStakeAction}>
              取回质押
            </SpinBtn>
          </div>
        </div>
      </>
    );
  }

  return null;
};

export default MountBack;
