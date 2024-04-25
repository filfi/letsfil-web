import { useMemo } from 'react';

import useRaiseBase from './useRaiseBase';
import useRaiseRate from './useRaiseRate';
import useRaiseRole from './useRaiseRole';
import useDepositOps from './useDepositOps';
import useUserAssets from './useUserAssets';
import { toFixed, toNumber } from '@/utils/format';
import useDepositInvestor from './useDepositInvestor';
import { accAdd, accDiv, accMul, accSub } from '@/utils/utils';

export default function useAssetPack(plan?: API.Plan | null, pack?: API.Pack | null) {
  const { isRaiser, isServicer } = useRaiseRole(plan);
  const { actual, progress: _progress, target } = useRaiseBase(plan);
  const { opsBack, opsSealed, safeSealed, ...opsAction } = useDepositOps(plan);
  const { pledge, collateral, leverage, ...user } = useUserAssets(plan?.raising_id);
  const { amount, backAmount, backInterest, record, ...investorAction } = useDepositInvestor(plan);
  const { priorityRate, raiserRate, superRate, opsRatio: ratio, servicerRate } = useRaiseRate(plan);

  // 总算力
  const sealedPower = useMemo(() => +`${pack?.total_power || 0}`, [pack?.total_power]);
  // 封装扇区
  const sealedSector = useMemo(() => +`${pack?.total_sector || 0}`, [pack?.total_sector]);
  // 已封装质押
  const sealedPledge = useMemo(() => toNumber(pack?.total_pledge_amount), [pack?.total_pledge_amount]);

  // 已缴纳运维保证金 = (募集目标 * 保证金分配比例) / (1 - 保证金分配比例)
  const opsActual = useMemo(
    () => Number(toFixed(accDiv(accMul(target, accDiv(ratio, 100)), accSub(1, accDiv(ratio, 100))), 2, 2)),
    [target, ratio],
  );
  // 实际配比运维保证金 = 已缴纳运维保证金 * 募集比例
  const opsCurrent = useMemo(() => accMul(opsActual, _progress), [opsActual, _progress]);
  // 总运维保证金 = 实际配比运维保证金 + 已封装缓冲金
  const opsAmount = useMemo(() => accAdd(opsCurrent, safeSealed ?? 0), [opsCurrent, safeSealed]);
  // 总质押 = 实际募集 + 总运维保证金
  const total = useMemo(() => accAdd(actual, opsAmount), [actual, opsAmount]);
  // 运维保证金占比 = 总运维保证金 / 总质押
  const opsRatio = useMemo(() => (total > 0 ? accDiv(opsAmount, total) : 0), [opsAmount, total]);
  // 封装进度 = 已封装质押 / (实际募集 + 实际配比运维保证金)
  const sealProgress = useMemo(
    () => (actual > 0 ? accDiv(sealedPledge, accAdd(actual, opsCurrent)) : 0),
    [sealedPledge, actual, opsCurrent],
  );

  const isInvestor = useMemo(() => pledge > 0 || collateral > 0 || leverage > 0, [pledge, collateral, leverage]);
  // 建设者总质押
  const totalPledge = useMemo(() => accAdd(pledge, collateral, leverage), [pledge, collateral, leverage]);

  // 直接质押投资占比 = 投入金额 / 总质押
  const pledgeRatio = useMemo(() => (total > 0 ? accDiv(pledge, total) : 0), [pledge, total]);
  // 直接质押封装算力 = 总算力 * 我的权益比例
  const pledgeSealsPower = useMemo(() => accMul(sealedPower, pledgeRatio), [sealedPower, pledgeRatio]);
  // 直接质押权益算力 = 直接质押封装算力 * 建设者权益
  const pledgePower = useMemo(
    () => accMul(pledgeSealsPower, accDiv(priorityRate, 100)),
    [pledgeSealsPower, priorityRate],
  );

  // 抵押投资占比
  const collateralRatio = useMemo(() => (total > 0 ? accDiv(collateral, total) : 0), [collateral, total]);
  // 建设者抵押封装算力
  const collateralSealsPower = useMemo(() => accMul(sealedPower, collateralRatio), [collateralRatio, sealedPower]);
  // 建设者抵押权益算力
  const collateralPower = useMemo(
    () => accMul(collateralSealsPower, accDiv(priorityRate, 100)),
    [collateralSealsPower, priorityRate],
  );

  // 杠杆质押投资占比
  const leverageRatio = useMemo(() => (total > 0 ? accDiv(leverage, total) : 0), [leverage, total]);
  // 建设者杠杆质押封装算力
  const leverageSealsPower = useMemo(() => accMul(sealedPower, leverageRatio), [leverageRatio, sealedPower]);
  // 建设者杠杆质押权益算力
  const leveragePower = useMemo(
    () => accMul(leverageSealsPower, accDiv(priorityRate, 100)),
    [leverageSealsPower, priorityRate],
  );

  const investorRatio = useMemo(() => (total > 0 ? accDiv(totalPledge, total) : 0), [total, totalPledge]);
  // 建设者总封装算力
  const investorSealsPower = useMemo(
    () => accAdd(pledgeSealsPower, collateralSealsPower, leverageSealsPower),
    [pledgeSealsPower, collateralSealsPower, leverageSealsPower],
  );
  // 建设者总权益算力
  const investorPower = useMemo(
    () => accAdd(pledgePower, collateralPower, leveragePower),
    [pledgePower, collateralPower, leveragePower],
  );

  // 主办人持有算力 = 总算力 * 主办人权益
  const raiserPower = useMemo(
    () => (isRaiser ? accMul(sealedPower, accDiv(raiserRate || superRate, 100)) : 0),
    [sealedPower, raiserRate, superRate, isRaiser],
  );

  // 运维保证金封装算力 = 总算力 * 运维保证金占比
  const opsSealsPower = useMemo(
    () => (isServicer ? accMul(sealedPower, opsRatio) : 0),
    [sealedPower, opsRatio, isServicer],
  );
  // 运维保证金权益算力 = 运维保证金封装算力 * 运维保证金权益
  const opsPower = useMemo(
    () => (isServicer ? accMul(opsSealsPower, accDiv(priorityRate, 100)) : 0),
    [opsSealsPower, priorityRate, isServicer],
  );
  // 服务商权益算力 = 总算力 * 服务商权益
  const servicerPower = useMemo(
    () => (isServicer ? accMul(sealedPower, accDiv(servicerRate, 100)) : 0),
    [sealedPower, servicerRate, isServicer],
  );

  // 主办人持有质押
  const raiserPledge = useMemo(() => 0, []);
  // 服务商持有质押
  const servicerPledge = useMemo(() => 0, []);
  // 运维保证金持有质押
  const opsPledge = useMemo(
    () => (isServicer ? Math.max(accSub(sealedPledge, actual), 0) : 0),
    [actual, sealedPledge, isServicer],
  );
  // 建设者持有质押
  const investorPledge = useMemo(
    () =>
      isInvestor ? Math.min(accMul(sealedPledge, accDiv(totalPledge, accAdd(actual, opsAmount))), totalPledge) : 0,
    [actual, sealedPledge, opsAmount, totalPledge, isInvestor],
  );

  const isLoading = useMemo(
    () => investorAction.isLoading || user.isLoading,
    [investorAction.isLoading, user.isLoading],
  );

  const refetch = async () => {
    user.refetch();
    investorAction.refetch();
  };

  return {
    user,
    total,
    actual,
    opsPower,
    opsRatio,
    opsAmount,
    sealedPower,
    sealedPledge,
    sealedSector,
    sealProgress,
    isRaiser,
    isServicer,
    isInvestor,
    opsSealsPower,
    raiserPower,
    pledge,
    collateral,
    leverage,
    totalPledge,
    backAmount,
    backInterest,
    investorPower,
    investorRatio,
    investorSealsPower,
    investorAmount: amount,
    investorRecord: record,
    pledgePower,
    pledgeRatio,
    pledgeSealsPower,
    collateralRatio,
    collateralPower,
    collateralSealsPower,
    leverageRatio,
    leveragePower,
    leverageSealsPower,
    servicerPower,
    opsPledge,
    opsBack,
    opsSealed,
    raiserPledge,
    investorRate: priorityRate,
    raiserRate,
    servicerRate,
    superRate,
    investorPledge,
    servicerPledge,
    opsAction,
    investorAction,
    isLoading,
    refetch,
  };
}
