import { ethers } from 'ethers';
import { useRef } from 'react';
import { useModel } from '@umijs/max';

import SpinBtn from '@/components/SpinBtn';
import { formatAmount } from '@/utils/format';
import useLoadingify from '@/hooks/useLoadingify';
import WithdrawModal from '@/components/WithdrawModal';
import useRewardInvestor from '@/hooks/useRewardInvestor';

const isDisabled = (val?: number | string) => {
  const v = +`${val ?? ''}`;

  return Number.isNaN(v) || v <= 0;
};

const InvestorIncome: React.FC<{ address?: string }> = ({ address }) => {
  const modal = useRef<ModalAttrs>(null);

  const { initialState } = useModel('@@initialState');

  const { contract, reward, available, isInvestor } = useRewardInvestor(address);

  const { loading, run: handleWithdraw } = useLoadingify(async (address: string) => {
    await contract.investorWithdraw(address, ethers.utils.parseEther(`${available}`));
  });

  if (isInvestor) {
    return (
      <>
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">我的投资者收益</h5>
            <p className="mb-4">作为投资者在此计划中的收益</p>

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
                disabled={initialState?.processing || isDisabled(available)}
                onClick={() => modal.current?.show()}
              >
                <span className="me-2">提取</span>
                <i className="bi bi-chevron-right"></i>
              </SpinBtn>
            </div>
          </div>
        </div>

        <WithdrawModal ref={modal} onConfirm={handleWithdraw} title={`提取 ${formatAmount(available)} FIL`} />
      </>
    );
  }

  return null;
};

export default InvestorIncome;
