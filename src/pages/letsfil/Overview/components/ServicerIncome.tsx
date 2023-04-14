import { ethers } from 'ethers';
import { useModel } from '@umijs/max';

import Modal from '@/components/Modal';
import SpinBtn from '@/components/SpinBtn';
import { formatAmount } from '@/utils/format';
import useLoadingify from '@/hooks/useLoadingify';
import useRewardServicer from '@/hooks/useRewardServicer';

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

const ServicerIncome: React.FC<{ address?: string }> = ({ address }) => {
  const { initialState } = useModel('@@initialState');

  const { contract, reward, available } = useRewardServicer(address);

  const { loading, run: handleWithdraw } = useLoadingify(async () => {
    await contract.servicerWithdraw(ethers.utils.parseEther(`${available}`));
  });

  const onWithdraw = withConfirm(handleWithdraw, formatAmount(available));

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
};

export default ServicerIncome;
