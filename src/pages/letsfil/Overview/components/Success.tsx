import { useMemo } from 'react';

import Assets from './Assets';
import DepositOps from './DepositOps';
import DepositRaise from './DepositRaise';
import DepositInvest from './DepositInvest';
import IncomeRaiser from './RaiserIncome';
import IncomeInvestor from './InvestorIncome';
import IncomeServicer from './ServicerIncome';
import { NodeState } from '@/constants/state';
import usePlanState from '@/hooks/usePlanState';

const Success: React.FC<{ data?: API.Plan }> = ({ data }) => {
  const { nodeState } = usePlanState(data?.raise_address);

  const isNodeEnd = useMemo(() => nodeState === NodeState.Destroy, [nodeState]);
  const isNodeStart = useMemo(() => nodeState >= NodeState.Started, [nodeState]);

  return (
    <div className="d-flex flex-column gap-3">
      <Assets data={data} />

      <IncomeInvestor address={data?.raise_address} />

      <IncomeRaiser address={data?.raise_address} />

      <IncomeServicer address={data?.raise_address} />

      {isNodeStart && <DepositRaise address={data?.raise_address} />}

      {isNodeEnd && <DepositOps address={data?.raise_address} />}

      {isNodeEnd && <DepositInvest address={data?.raise_address} />}
    </div>
  );
};

export default Success;
