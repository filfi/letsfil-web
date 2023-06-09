// import Modal from '@/components/Modal';
import SpinBtn from '@/components/SpinBtn';
import { formatAmount } from '@/utils/format';
import useRaiseState from '@/hooks/useRaiseState';
import useDepositInvestor from '@/hooks/useDepositInvestor';

const CardBack: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { isClosed, isFailed, isWorking } = useRaiseState(data);
  const { amount, backAmount, backInterest, unstaking, isInvestor, unStakeAction } = useDepositInvestor(data);

  if (isInvestor && (isClosed || isFailed || isWorking)) {
    return (
      <>
        <div className="card section-card">
          <div className="card-header d-flex gap-3 border-0">
            <h4 className="card-title mb-0 me-auto">退回投资</h4>
            {/* <a className="text-underline" href="#back-modal" data-bs-toggle="modal">为什么退回？</a> */}
          </div>
          <div className="card-body py-2 fs-16 text-main">
            <p className="d-flex align-items-center gap-3 mb-2">
              <span>存入金额</span>
              <span className="ms-auto">
                <span className="fs-20 fw-600">{formatAmount(amount)}</span>
                <span className="ms-1 text-neutral">FIL</span>
              </span>
            </p>
            <p className="d-flex align-items-center gap-3 mb-2">
              <span>退回金额</span>
              <span className="ms-auto">
                <span className="fs-20 fw-600">{formatAmount(backAmount)}</span>
                <span className="ms-1 text-neutral">FIL</span>
              </span>
            </p>
            <p className="d-flex align-items-center gap-3 mb-2">
              <span>利息补偿</span>
              <span className="ms-auto">
                <span className="fs-20 fw-600 text-success">+{formatAmount(backInterest)}</span>
                <span className="ms-1 text-neutral">FIL</span>
              </span>
            </p>
          </div>
          <div className="card-footer">
            <SpinBtn className="btn btn-primary btn-lg w-100" disabled={backAmount <= 0} loading={unstaking} onClick={unStakeAction}>
              取回
            </SpinBtn>
          </div>
        </div>

        {/* <Modal.Alert id="back-modal" title="为什么退回？" confirmText="我知道了">
          <div className="card border-0 card-body">
            <p>为什么退回？</p>
          </div>
        </Modal.Alert> */}
      </>
    );
  }

  return null;
};

export default CardBack;
