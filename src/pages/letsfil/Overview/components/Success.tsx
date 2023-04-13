import { useMemo } from 'react';

import * as U from '@/utils/utils';
import { NodeState } from '@/constants/state';
import useAccounts from '@/hooks/useAccounts';
import Assets from './Assets';
import OpsDeposit from './OpsDeposit';
import RaiseDeposit from './RaiseDeposit';
import InvestDeposit from './InvestDeposit';
import RaiserIncome from './RaiserIncome';
import InvestorIncome from './InvestorIncome';
import ServicerIncome from './ServicerIncome';

const Success: React.FC<{
  data?: API.Base;
  state?: number;
  ops?: number | string;
  raise?: number | string;
  invest?: number | string;
  total?: number | string;
  usable?: number | string;
  onWithdrawOpsFund?: () => void;
  onWithdrawRaiseFund?: () => void;
  onWithdrawInvestFund?: (amount: number | string) => void;
}> = ({ data, ops = 0, raise = 0, state = 0, invest = 0, total = 0, usable = 0, onWithdrawOpsFund, onWithdrawRaiseFund, onWithdrawInvestFund }) => {
  const { accounts } = useAccounts();
  const isInvestor = useMemo(() => +invest > 0, [invest]);
  const isNodeEnd = useMemo(() => state === NodeState.Destroy, [state]);
  const isNodeStart = useMemo(() => state >= NodeState.Started, [state]);
  const isRaiser = useMemo(() => U.isEqual(data?.raiser, accounts[0]), [data, accounts]);
  const isProvider = useMemo(() => U.isEqual(data?.service_provider_address, accounts[0]), [data, accounts]);

  const handleWithdraw = (amount: number | string) => {
    onWithdrawInvestFund?.(amount);
  };

  return (
    <div className="d-flex flex-column gap-3">
      {isInvestor && <Assets amount={invest} />}

      {isInvestor && <InvestorIncome total={total} usable={usable} onWithdraw={() => handleWithdraw(usable)} />}

      {isRaiser && <RaiserIncome total={total} usable={usable} onWithdraw={() => handleWithdraw(usable)} />}

      {isProvider && <ServicerIncome total={total} usable={usable} onWithdraw={() => handleWithdraw(usable)} />}

      {isRaiser && isNodeStart && <RaiseDeposit amount={raise} state={state} onWithdraw={onWithdrawRaiseFund} />}

      {isRaiser && isNodeEnd && <OpsDeposit amount={ops} onWithdraw={onWithdrawOpsFund} />}

      {isRaiser && isNodeEnd && <InvestDeposit amount={invest} onWithdraw={() => handleWithdraw(invest)} />}
    </div>
  );
};

export default Success;
