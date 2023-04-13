import { useModel } from '@umijs/max';
import Modal from '@/components/Modal';
import { formatAmount, formatEther } from '@/utils/format';

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

const ServicerIncome: React.FC<{
  data?: API.Base;
  total?: number | string;
  usable?: number | string;
  onWithdraw?: () => void;
}> = ({ total = 0, usable = 0, onWithdraw }) => {
  const { initialState } = useModel('@@initialState');

  const handleWithdraw = withConfirm(onWithdraw, formatAmount(usable));

  return (
    <>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">我的服务商收益</h5>
          <p className="mb-4">作为服务商在此计划中的收益</p>

          <div className="d-flex align-items-center mb-3">
            <div className="me-3">
              <p className="mb-1 fw-500">已分配FIL</p>
              <p className="mb-0 text-main">
                <span className="decimal me-2">{formatEther(total)}</span>
                <span className="unit text-neutral">FIL</span>
              </p>
            </div>
          </div>
          <div className="d-flex align-items-center">
            <div className="me-3">
              <p className="mb-1 fw-500">待提取FIL</p>
              <p className="mb-0 text-main">
                <span className="decimal me-2">{formatAmount(usable)}</span>
                <span className="unit text-neutral">FIL</span>
              </p>
            </div>
            <button type="button" className="btn btn-light btn-md ms-auto" disabled={initialState?.processing || isDisabled(usable)} onClick={handleWithdraw}>
              <span className="me-2">提取</span>
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ServicerIncome;
