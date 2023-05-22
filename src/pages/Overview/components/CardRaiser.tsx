import SpinBtn from '@/components/SpinBtn';
import { formatAmount } from '@/utils/format';
import useRaiseState from '@/hooks/useRaiseState';
import useDepositRaise from '@/hooks/useDepositRaise';

const CardRaiser: React.FC<{ data?: API.Plan }> = ({ data }) => {
  const { amount } = useDepositRaise(data);
  const { isClosed, isFailed, isFinished } = useRaiseState(data);

  if (isClosed || isFailed || isFinished) {
    return (
      <div className="card section-card">
        <div className="card-body">
          <div className="d-flex flex-wrap align-items-center">
            <h5 className="card-title mb-0 me-auto pe-2">募集保证金</h5>
            <p className="mb-0 text-main">
              <span className="fs-5 fw-600">{formatAmount(amount)}</span>
              <span className="text-neutral ms-1">FIL</span>
            </p>
          </div>
          {(isClosed || isFailed) && (
            <div className="d-flex flex-wrap align-items-center mt-2">
              <div className="card-title mb-0 d-inline-flex align-items-center me-auto pe-2">
                <h5 className="card-title mb-0">利息罚金</h5>
                <span className="mx-1">·</span>
                <a className="text-underline" href="#">
                  明细
                </a>
              </div>
              <p className="mb-0 text-danger">
                <span className="fs-5 fw-600">-0</span>
                <span className="text-neutral ms-1">FIL</span>
              </p>
            </div>
          )}
        </div>
        <div className="card-footer">
          <SpinBtn className="btn btn-primary btn-lg w-100">取回</SpinBtn>
        </div>
      </div>
    );
  }

  return null;
};

export default CardRaiser;
