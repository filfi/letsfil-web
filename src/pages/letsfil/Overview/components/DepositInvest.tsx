import { useModel } from '@umijs/max';

import Modal from '@/components/Modal';
import SpinBtn from '@/components/SpinBtn';
import { formatAmount } from '@/utils/format';
import useDepositInvest from '@/hooks/useDepositInvest';

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

const DepositInvest: React.FC<{ address?: string }> = ({ address }) => {
  const { initialState } = useModel('@@initialState');

  const { cost, loading, withdraw } = useDepositInvest(address);

  const onWithdraw = withConfirm(withdraw, formatAmount(cost));

  return (
    <>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title mb-3">节点运行结束，可提取投资额</h5>

          <div className="d-flex align-items-center">
            <div className="me-3">
              <p className="mb-1 fw-500">我的投资额</p>
              <p className="mb-0 text-main">
                <span className="decimal me-2">{formatAmount(cost)}</span>
                <span className="unit text-neutral">FIL</span>
              </p>
            </div>

            <SpinBtn className="btn btn-light btn-md ms-auto" loading={loading} disabled={initialState?.processing || isDisabled(cost)} onClick={onWithdraw}>
              <span className="me-2">提取</span>
              <i className="bi bi-chevron-right"></i>
            </SpinBtn>
          </div>
        </div>
      </div>
    </>
  );
};

export default DepositInvest;
