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

const isDisabled = (val?: number | string) => {
  const v = +`${val ?? ''}`;

  return Number.isNaN(v) || v <= 0;
};

const Failed: React.FC<{
  state?: number;
  ops?: number | string;
  raise?: number | string;
  invest?: number | string;
  onWithdrawRaiseFund?: () => void;
  onWithdrawOpsFund?: () => void;
  onWithdrawInvestFund?: (amount: number | string) => void;
}> = ({ state, ops = 0, raise = 0, invest = 0, onWithdrawOpsFund, onWithdrawRaiseFund, onWithdrawInvestFund }) => {
  const { initialState } = useModel('@@initialState');

  const withdrawFund = withConfirm(onWithdrawRaiseFund, formatEther(raise));

  const withdrawOpsFund = withConfirm(onWithdrawOpsFund, formatEther(ops));

  const withdrawInvestFund = withConfirm(onWithdrawInvestFund, formatAmount(invest));

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
                <span className="decimal me-2">{formatEther(raise)}</span>
                <span className="unit text-neutral">FIL</span>
              </p>
            </div>
            <button type="button" className="btn btn-light btn-md ms-auto" disabled={initialState?.processing || isDisabled(raise)} onClick={withdrawFund}>
              <span className="me-2">提取</span>
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
          <div className="d-flex align-items-center mb-3">
            <div className="me-3">
              <p className="mb-1 fw-500">运维保证金</p>
              <p className="mb-0 text-main">
                <span className="decimal me-2">{formatEther(ops)}</span>
                <span className="unit text-neutral">FIL</span>
              </p>
            </div>
            <button type="button" className="btn btn-light btn-md ms-auto" disabled={initialState?.processing || isDisabled(ops)} onClick={withdrawOpsFund}>
              <span className="me-2">提取</span>
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
          <div className="d-flex align-items-center">
            <div className="me-3">
              <p className="mb-1 fw-500">我的投资额</p>
              <p className="mb-0 text-main">
                <span className="decimal me-2">{formatAmount(invest)}</span>
                <span className="unit text-neutral">FIL</span>
              </p>
            </div>
            <button
              type="button"
              className="btn btn-light btn-md ms-auto"
              disabled={initialState?.processing || isDisabled(invest)}
              onClick={() => withdrawInvestFund(invest)}
            >
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
