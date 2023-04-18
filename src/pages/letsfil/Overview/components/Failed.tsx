import { useModel } from '@umijs/max';

import Modal from '@/components/Modal';
import SpinBtn from '@/components/SpinBtn';
import { formatAmount } from '@/utils/format';
import { RaiseState } from '@/constants/state';
import usePlanState from '@/hooks/usePlanState';
import useDepositOps from '@/hooks/useDepositOps';
import useDepositRaise from '@/hooks/useDepositRaise';
import useDepositInvest from '@/hooks/useDepositInvest';

const withConfirm = <P extends unknown[]>(handler?: (...args: P) => void, amount?: string) => {
  return (...args: P) => {
    Modal.confirm({
      title: `提取 ${amount} FIL`,
      content: '将提取到您当前登录账户对应的钱包地址；提取行为将产生Gas费',
      onConfirm: () => {
        handler?.(...args);
      },
    });
  };
};

const isDisabled = (val?: number | string) => {
  const v = +`${val ?? ''}`;

  return Number.isNaN(v) || v <= 0;
};

const Failed: React.FC<{ data?: API.Plan }> = ({ data }) => {
  const { initialState } = useModel('@@initialState');

  const { planState } = usePlanState(data?.raise_address);
  const { cost: invest, isInvestor, loading, withdraw: withdrawCost } = useDepositInvest(data?.raise_address);
  const { amount: ops, isOpsPayer, loading: opsLoading, withdraw: withdrawOps } = useDepositOps(data?.raise_address);
  const { amount: raise, isRaiser, loading: raiseLoading, withdraw: withdrawRaise } = useDepositRaise(data?.raise_address);

  const handleOps = withConfirm(withdrawOps, formatAmount(ops));
  const handleRaise = withConfirm(withdrawRaise, formatAmount(raise));
  const handleInvest = withConfirm(withdrawCost, formatAmount(invest));

  return (
    <>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">{planState === RaiseState.Closed ? '计划已关闭' : '未达成募集目标，募集失败'}</h5>
          <p className="mb-4">{planState === RaiseState.Closed ? '募集商已将该计划关闭，募集终止' : '超过截止时间，募集未达成目标'}</p>

          {isRaiser && (
            <div className="d-flex align-items-center">
              <div className="me-3">
                <p className="mb-1 fw-500">募集保证金</p>
                <p className="mb-0 text-main">
                  <span className="decimal me-2">{formatAmount(raise)}</span>
                  <span className="unit text-neutral">FIL</span>
                </p>
              </div>

              <SpinBtn
                className="btn btn-light btn-md ms-auto"
                loading={raiseLoading}
                disabled={initialState?.processing || isDisabled(raise)}
                onClick={handleRaise}
              >
                <span className="me-2">提取</span>
                <i className="bi bi-chevron-right"></i>
              </SpinBtn>
            </div>
          )}

          {isOpsPayer && (
            <div className="d-flex align-items-center mt-3">
              <div className="me-3">
                <p className="mb-1 fw-500">运维保证金</p>
                <p className="mb-0 text-main">
                  <span className="decimal me-2">{formatAmount(ops)}</span>
                  <span className="unit text-neutral">FIL</span>
                </p>
              </div>
              <SpinBtn className="btn btn-light btn-md ms-auto" loading={opsLoading} disabled={initialState?.processing || isDisabled(ops)} onClick={handleOps}>
                <span className="me-2">提取</span>
                <i className="bi bi-chevron-right"></i>
              </SpinBtn>
            </div>
          )}

          {isInvestor && (
            <div className="d-flex align-items-center mt-3">
              <div className="me-3">
                <p className="mb-1 fw-500">我的投资额</p>
                <p className="mb-0 text-main">
                  <span className="decimal me-2">{formatAmount(invest)}</span>
                  <span className="unit text-neutral">FIL</span>
                </p>
              </div>

              <SpinBtn
                className="btn btn-light btn-md ms-auto"
                loading={loading}
                disabled={initialState?.processing || isDisabled(invest)}
                onClick={handleInvest}
              >
                <span className="me-2">提取</span>
                <i className="bi bi-chevron-right"></i>
              </SpinBtn>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Failed;
