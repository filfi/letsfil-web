import { useEffect, useMemo, useState } from 'react';

import useAccounts from './useAccounts';
import { EventType } from '@/utils/mitt';
import { toNumber } from '@/utils/format';
import useLoadingify from './useLoadingify';
import useProcessify from './useProcessify';
import useEmittHandler from './useEmitHandler';
import useRaiseContract from './useRaiseContract';
import { accDiv /* , accMul, accSub */ } from '@/utils/utils';

export default function useDepositInvest(data?: API.Plan) {
  const { account } = useAccounts();
  const contract = useRaiseContract(data?.raise_address);

  const [sealed, setSealed] = useState(0); // 已封装金额
  const [total, setTotal] = useState(toNumber(data?.actual_amount)); // 质押总额
  const [target, setTarget] = useState(toNumber(data?.target_amount)); // 募集目标
  const [amount, setAmount] = useState(0); // 用户质押金额
  const [record, setRecord] = useState(0); // 用户累计质押金额
  const [interest, setInterest] = useState(0); // 用户罚息
  const [withdraw, setWithdraw] = useState(0); // 用户已提取
  const [backAmount, setBackAmount] = useState(0); // 退回金额
  const [backInterest, setBackInterest] = useState(0); // 退回利息

  const isInvestor = useMemo(() => record > 0, [record]);
  // const sealDays = useMemo(() => data?.seal_days ?? 0, [data?.seal_days]); // 封装期限（天）
  const ratio = useMemo(() => (total > 0 ? accDiv(record, total) : 0), [record, total]); // 投资占比
  const progress = useMemo(() => (target > 0 ? accDiv(total, target) : 0), [target, total]); // 募集进度
  // const remainAmount = useMemo(() => Math.max(accSub(total, sealed), 0), [total, sealed]); // 剩余未封装的金额
  // const backInterest = useMemo(() => accMul(remainAmount, sealDays, 0.03), [sealDays, remainAmount]); // 利息补偿

  const [loading, fetchData] = useLoadingify(async () => {
    if (!data) return;

    if (account) {
      const info = await contract.getInvestorInfo(data.raising_id, account);
      const back = await contract.getBackAssets(data.raising_id, account);

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

    const raise = await contract.getRaiseInfo(data.raising_id);
    const sealed = await contract.getSealedAmount(data.raising_id);
    // const pledge = await contract.pledgeTotalAmount(data.raising_id);
    const pledge = await contract.getTotalPledgeAmount(data.raising_id);

    setTotal(toNumber(pledge));
    setSealed(toNumber(sealed));
    setTarget(toNumber(raise?.targetAmount));
  });

  const [processing, unStaking] = useProcessify(async () => {
    if (!data) return;

    await contract.unStaking(data.raising_id);
  });

  useEffect(() => {
    fetchData();
  }, [account, data]);

  useEmittHandler({
    [EventType.onStaking]: fetchData,
    [EventType.onUnstaking]: fetchData,
  });

  return {
    amount,
    record,
    ratio,
    total,
    sealed,
    target,
    progress,
    interest,
    withdraw,
    backAmount,
    backInterest,
    isInvestor,
    loading,
    processing,
    unStaking,
    refresh: fetchData,
  };
}
