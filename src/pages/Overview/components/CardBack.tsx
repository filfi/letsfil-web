import { useMemo } from 'react';
import { useModel } from '@umijs/max';

// import Modal from '@/components/Modal';
import SpinBtn from '@/components/SpinBtn';
import { formatAmount, toNumber } from '@/utils/format';
import useReleasedPledge from '@/hooks/useReleasedPledge';

const blocks = [
  { id: '22517091689516974', released: '194654768813898639' },
  { id: '23091121690598746', released: '181500663088116717336' },
];

const CardBack: React.FC = () => {
  const { assets, plan, state } = useModel('Overview.overview');
  const { released } = useReleasedPledge(plan);
  const { isClosed, isFailed, isWorking } = state;
  const { backAmount, backInterest, totalPledge, isInvestor, investorAction } = assets;

  const backReleased = useMemo(() => {
    const item = blocks.find((i) => i.id === plan?.raising_id);

    if (item && released <= toNumber(item.released)) {
      return 0;
    }

    return backAmount;
  }, [plan, backAmount, released]);

  if (isInvestor && (isClosed || isFailed || isWorking || released > 0)) {
    return (
      <>
        <div className="card section-card sticky-card">
          <div className="card-header d-flex gap-3 border-0">
            <h4 className="card-title mb-0 me-auto">退回投資</h4>
            {/* <a className="text-underline" href="#back-modal" data-bs-toggle="modal">為什麼退回？</a> */}
          </div>
          <div className="card-body py-2 fs-16 text-main">
            <p className="d-flex align-items-center gap-3 mb-2">
              <span>存入數量</span>
              <span className="ms-auto">
                <span className="fs-20 fw-600">{formatAmount(totalPledge)}</span>
                <span className="ms-1 text-neutral">FIL</span>
              </span>
            </p>
            <p className="d-flex align-items-center gap-3 mb-2">
              <span>退回數量</span>
              <span className="ms-auto">
                <span className="fs-20 fw-600">{formatAmount(backReleased)}</span>
                <span className="ms-1 text-neutral">FIL</span>
              </span>
            </p>
            <p className="d-flex align-items-center gap-3 mb-2">
              <span>利息補償</span>
              <span className="ms-auto">
                <span className="fs-20 fw-600 text-success">+{formatAmount(backInterest)}</span>
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
              取回
            </SpinBtn>
          </div>
        </div>

        {/* <Modal.Alert id="back-modal" title="為什麼退回？" confirmText="我知道了">
          <div className="card border-0 card-body">
            <p>為什麼退回？</p>
          </div>
        </Modal.Alert> */}
      </>
    );
  }

  return null;
};

export default CardBack;
