import { useModel } from '@umijs/max';
import Modal from '@/components/Modal';
import { RaiseState } from '@/constants/state';
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

const Failed: React.FC<{
  amount?: number | string;
  data?: API.Base;
  state?: number;
  onWithdrawRaiseFund?: () => void;
  onWithdrawOpsFund?: () => void;
  onWithdrawInvestFund?: () => void;
}> = ({ amount, data, state, onWithdrawRaiseFund, onWithdrawOpsFund, onWithdrawInvestFund }) => {
  const { initialState } = useModel('@@initialState');

  const withdrawFund = withConfirm(onWithdrawRaiseFund, formatEther(data?.security_fund));

  const withdrawOpsFund = withConfirm(onWithdrawOpsFund, formatEther(data?.ops_security_fund));

  const withdrawInvestFund = withConfirm(onWithdrawInvestFund, formatAmount(amount));

  return (
    <>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">{state === RaiseState.Closed ? '计划已关闭' : '未达成募集目标，募集失败'}</h5>
          <p className="mb-4">{state === RaiseState.Closed ? '募集商已将该计划关闭，募集终止' : '超过截止时间，募集未达成目标'}</p>

          <div className="d-flex align-items-center mb-3">
            <div className="me-3">
              <p className="mb-1 fw-500">募集保证金</p>
              <p className="mb-0 text-main">
                <span className="decimal me-2">{formatEther(data?.security_fund)}</span>
                <span className="unit text-neutral">FIL</span>
              </p>
            </div>
            <button type="button" className="btn btn-light btn-md ms-auto" disabled={initialState?.processing} onClick={withdrawFund}>
              <span className="me-2">提取</span>
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
          <div className="d-flex align-items-center mb-3">
            <div className="me-3">
              <p className="mb-1 fw-500">运维保证金</p>
              <p className="mb-0 text-main">
                <span className="decimal me-2">{formatEther(data?.ops_security_fund)}</span>
                <span className="unit text-neutral">FIL</span>
              </p>
            </div>
            <button type="button" className="btn btn-light btn-md ms-auto" disabled={initialState?.processing} onClick={withdrawOpsFund}>
              <span className="me-2">提取</span>
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
          <div className="d-flex align-items-center">
            <div className="me-3">
              <p className="mb-1 fw-500">我的投资额</p>
              <p className="mb-0 text-main">
                <span className="decimal me-2">{formatAmount(amount)}</span>
                <span className="unit text-neutral">FIL</span>
              </p>
            </div>
            <button type="button" className="btn btn-light btn-md ms-auto" disabled={initialState?.processing} onClick={withdrawInvestFund}>
              <span className="me-2">提取</span>
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Failed;
