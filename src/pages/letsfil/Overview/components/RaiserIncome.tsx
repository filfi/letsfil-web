import { ethers } from 'ethers';
import { useModel } from '@umijs/max';

import Modal from '@/components/Modal';
import SpinBtn from '@/components/SpinBtn';
import { formatAmount } from '@/utils/format';
import useProcessify from '@/hooks/useProcessify';
import useRewardRaiser from '@/hooks/useRewardRaiser';

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

const RaiserIncome: React.FC<{ address?: string }> = ({ address }) => {
  const { initialState } = useModel('@@initialState');

  const { contract, reward, available, isRaiser } = useRewardRaiser(address);

  const [loading, withdraw] = useProcessify(async () => {
    await contract.raiserWithdraw(ethers.utils.parseEther(`${available}`));
  });

  const onWithdraw = withConfirm(withdraw, formatAmount(available));

  if (isRaiser) {
    return (
      <>
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">我的募集商收益</h5>
            <p className="mb-4">作为募集商在此计划中的收益</p>

            <div className="d-flex align-items-center mb-3">
              <div className="me-3">
                <p className="mb-1 fw-500">已分配FIL</p>
                <p className="mb-0 text-main">
                  <span className="decimal me-2">{formatAmount(reward)}</span>
                  <span className="unit text-neutral">FIL</span>
                </p>
              </div>
            </div>
            <div className="d-flex align-items-center">
              <div className="me-3">
                <p className="mb-1 fw-500">待提取FIL</p>
                <p className="mb-0 text-main">
                  <span className="decimal me-2">{formatAmount(available)}</span>
                  <span className="unit text-neutral">FIL</span>
                </p>
              </div>
              <SpinBtn
                type="button"
                className="btn btn-light btn-md ms-auto"
                loading={loading}
                onClick={onWithdraw}
                disabled={initialState?.processing || isDisabled(available)}
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

export default RaiserIncome;
