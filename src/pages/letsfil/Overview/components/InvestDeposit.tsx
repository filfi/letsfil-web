import { useModel } from '@umijs/max';

import Modal from '@/components/Modal';
import { formatEther } from '@/utils/format';

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

const InvestDeposit: React.FC<{
  amount?: number | string;
  onWithdraw?: () => void;
}> = ({ amount, onWithdraw }) => {
  const { initialState } = useModel('@@initialState');

  const handleWithdraw = withConfirm(onWithdraw, formatEther(amount));

  return (
    <>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title mb-3">节点运行结束，可提取投资额</h5>

          <div className="d-flex align-items-center">
            <div className="me-3">
              <p className="mb-1 fw-500">我的投资额</p>
              <p className="mb-0 text-main">
                <span className="decimal me-2">{formatEther(amount)}</span>
                <span className="unit text-neutral">FIL</span>
              </p>
            </div>
            <button type="button" className="btn btn-light btn-md ms-auto" disabled={initialState?.processing || isDisabled(amount)} onClick={handleWithdraw}>
              <span className="me-2">提取</span>
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InvestDeposit;
