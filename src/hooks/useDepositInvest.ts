import { ethers } from 'ethers';
import { useEffect, useMemo, useState } from 'react';

import useAccounts from './useAccounts';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useDepositOps from './useDepositOps';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import useEmittHandler from './useEmitHandler';
import { accDiv, accSub } from '@/utils/utils';
import useRaiseContract from './useRaiseContract';

export default function useDepositInvest(data?: API.Plan) {
  const { account } = useAccounts();
  const { getContract } = useRaiseContract();
  const { amount: opsAmount, isOpsPayer } = useDepositOps(data);

  const [total, setTotal] = useState(0); // 募集目标
  const [amount, setAmount] = useState(0); // 用户质押金额
  const [record, setRecord] = useState(0); // 用户累计质押金额
  const [totalPledge, setTotalPledge] = useState(0); // 计划总质押
  // 投资成本。若是运维保证金支付人，则减去运维保证金
  const cost = useMemo(() => (isOpsPayer ? Math.max(accSub(amount, opsAmount), 0) : amount), [amount, opsAmount, isOpsPayer]);
  const isInvestor = useMemo(() => cost > 0, [cost]);
  const percent = useMemo(() => (total > 0 ? accDiv(totalPledge, total) : 0), [total, totalPledge]);

  const [fetching, fetchData] = useLoadingify(async () => {
    if (!data) return;

    const contract = getContract(data.raise_address);

    if (account) {
      const amount = await contract?.pledgeTotalAmount(data.raising_id);
      const record = await contract?.pledgeTotalCalcAmount(data.raising_id);

      setAmount(toNumber(amount));
      setRecord(toNumber(record));
    }

    const raise = await contract?.raiseInfo(data.raising_id);
    const pledge = await contract?.pledgeTotalAmount(data.raising_id);
    setTotalPledge(toNumber(pledge));
    setTotal(toNumber(raise?.targetAmount));
  });

  const [loading, withdraw] = useProcessify(async () => {
    if (!data) return;

    const contract = getContract(data.raise_address);
    await contract?.unStaking(ethers.utils.parseEther(`${cost}`));
  });

  useEffect(() => {
    fetchData();
  }, [account, data]);

  useEmittHandler({
    [EventType.onStaking]: fetchData,
    [EventType.onUnstaking]: fetchData,
    [EventType.onWithdrawOpsFund]: fetchData,
  });

  return {
    amount,
    account,
    cost,
    record,
    percent,
    total,
    totalPledge,
    isInvestor,
    fetching,
    loading,
    withdraw,
    refresh: fetchData,
  };
}
