import { useModel } from '@umijs/max';

import Modal from '@/components/Modal';
import SpinBtn from '@/components/SpinBtn';
import { formatAmount } from '@/utils/format';
import useDepositOps from '@/hooks/useDepositOps';

const withConfirm = <P extends unknown[]>(handler?: (...args: P) => void, amount?: number | string) => {
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

const DepositOps: React.FC<{ address?: string }> = ({ address }) => {
  const { initialState } = useModel('@@initialState');

  const { amount, loading, isOpsPayer, withdraw } = useDepositOps(address);

  const onWithdraw = withConfirm(withdraw, formatAmount(amount));

  if (isOpsPayer) {
    return (
      <>
        <div className="card">
          <div className="card-body">
            <h5 className="card-title mb-3">节点运行结束，可提取运维保证金</h5>

            <div className="d-flex align-items-center">
              <div className="me-3">
                <p className="mb-1 fw-500">运维保证金</p>
                <p className="mb-0 text-main">
                  <span className="decimal me-2">{formatAmount(amount)}</span>
                  <span className="unit text-neutral">FIL</span>
                </p>
              </div>

              <SpinBtn
                className="btn btn-light btn-md ms-auto"
                loading={loading}
                disabled={initialState?.processing || isDisabled(amount)}
                onClick={onWithdraw}
              >
                <span className="me-2">提取</span>
                <i className="bi bi-chevron-right"></i>
              </SpinBtn>
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
};

export default DepositOps;
