import { useEffect, useMemo, useState } from 'react';

import { accDiv } from '@/utils/utils';
import useAccounts from './useAccounts';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import useEmittHandler from './useEmitHandler';
import useRaiseContract from './useRaiseContract';

export default function useDepositInvest(data?: API.Plan) {
  const { account } = useAccounts();
  const { getContract } = useRaiseContract();

  const [total, setTotal] = useState(0); // 质押总额
  const [target, setTarget] = useState(0); // 募集目标
  const [amount, setAmount] = useState(0); // 用户质押金额
  const [record, setRecord] = useState(0); // 用户累计质押金额
  const [interest, setInterest] = useState(0); // 用户罚息
  const [withdraw, setWithdraw] = useState(0); // 用户已提取
  const [backAmount, setBackAmount] = useState(0); // 退回金额
  const [backInterest, setBackInterest] = useState(0); // 退回利息

  const isInvestor = useMemo(() => record > 0, [record]);
  const percent = useMemo(() => (target > 0 ? accDiv(total, target) : 0), [target, total]);

  const [fetching, fetchData] = useLoadingify(async () => {
    if (!data) return;

    const contract = getContract(data.raise_address);

    if (account) {
      const info = await contract?.investorInfo(data.raising_id, account);
      const back = await contract?.getBack(data.raising_id, account);

      const amount = info?.pledgeAmount;
      const record = info?.pledgeCalcAmount;
      const interest = info?.interestDebt;
      const withdraw = info?.withdrawAmount;
      const backAmount = back?.[0];
      const backInterest = back?.[1];

      setAmount(toNumber(amount));
      setRecord(toNumber(record));
      setInterest(toNumber(interest));
      setWithdraw(toNumber(withdraw));
      setBackAmount(toNumber(backAmount));
      setBackInterest(toNumber(backInterest));
    }

    const raise = await contract?.raiseInfo(data.raising_id);
    const pledge = await contract?.pledgeTotalAmount(data.raising_id);
    setTotal(toNumber(pledge));
    setTarget(toNumber(raise?.targetAmount));
  });

  const [loading, unStaking] = useProcessify(async () => {
    if (!data) return;

    const contract = getContract(data.raise_address);
    await contract?.unStaking(data.raising_id);
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
    record,
    total,
    target,
    percent,
    interest,
    withdraw,
    backAmount,
    backInterest,
    isInvestor,
    fetching,
    loading,
    unStaking,
    refresh: fetchData,
  };
}
