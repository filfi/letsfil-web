import { useMemo } from 'react';

import * as U from '@/utils/utils';
import { NodeState } from '@/constants/state';
import useAccounts from '@/hooks/useAccounts';
import usePlanState from '@/hooks/usePlanState';
import useDepositInvest from '@/hooks/useDepositInvest';
import Assets from './Assets';
import DepositOps from './DepositOps';
import DepositRaise from './DepositRaise';
import DepositInvest from './DepositInvest';
import IncomeRaiser from './RaiserIncome';
import IncomeServicer from './ServicerIncome';
import IncomeInvestor from './InvestorIncome';
import useRewardInvestor from '@/hooks/useRewardInvestor';

const Success: React.FC<{ data?: API.Plan }> = ({ data }) => {
  const { accounts } = useAccounts();
  const { nodeState } = usePlanState(data?.raise_address);
  const { amount } = useDepositInvest(data?.raise_address);
  const { reward } = useRewardInvestor(data?.raise_address);

  const isInvestor = useMemo(() => amount > 0 || reward > 0, [amount, reward]);
  const isNodeEnd = useMemo(() => nodeState === NodeState.Destroy, [nodeState]);
  const isNodeStart = useMemo(() => nodeState >= NodeState.Started, [nodeState]);
  const isRaiser = useMemo(() => U.isEqual(data?.raiser, accounts[0]), [data, accounts]);
  const isServicer = useMemo(() => U.isEqual(data?.service_provider_address, accounts[0]), [data, accounts]);
  const isOpsPayer = useMemo(() => U.isEqual(data?.ops_security_fund_address, accounts[0]), [data, accounts]);

  return (
    <div className="d-flex flex-column gap-3">
      {isInvestor && <Assets data={data} />}

      {isInvestor && <IncomeInvestor address={data?.raise_address} />}

      {isRaiser && <IncomeRaiser address={data?.raise_address} />}

      {isServicer && <IncomeServicer address={data?.raise_address} />}

      {isRaiser && isNodeStart && <DepositRaise address={data?.raise_address} />}

      {isOpsPayer && isNodeEnd && <DepositOps address={data?.raise_address} />}

      {isInvestor && isNodeEnd && <DepositInvest address={data?.raise_address} />}
    </div>
  );
};

export default Success;
