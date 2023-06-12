import { useMemo } from 'react';

import { accMul } from '@/utils/utils';
import useAssetPack from '@/hooks/useAssetPack';
import useRaiseRate from '@/hooks/useRaiseRate';
import useRewardInvestor from '@/hooks/useRewardInvestor';
import useDepositInvestor from '@/hooks/useDepositInvestor';
import { formatAmount, formatPower } from '@/utils/format';

export type ItemProps = {
  pack: API.Pack;
  plan?: API.Plan | null;
};

export default function CardInvestor({ pack, plan }: React.PropsWithChildren<ItemProps>) {
  const { priorityRate } = useRaiseRate(plan);
  const { reward } = useRewardInvestor(plan);
  const { amount, ratio } = useDepositInvestor(plan);
  const { investorPower, power } = useAssetPack(plan, pack);

  const sealsPower = useMemo(() => accMul(power, ratio), [power, ratio]);

  return (
    <>
      <p className="d-flex my-3 gap-3">
        <span className="text-gray-dark">质押</span>
        <span className="ms-auto">
          <span className="fs-16 fw-600">{formatAmount(amount)}</span>
          <span className="text-gray-dark ms-1">FIL</span>
        </span>
      </p>
      <p className="d-flex my-3 gap-3">
        <span className="text-gray-dark">封装算力(QAP)</span>
        <span className="ms-auto">
          <span className="fs-16 fw-600">{formatPower(sealsPower)?.[0]}</span>
          <span className="text-gray-dark ms-1">{formatPower(sealsPower)?.[1]}</span>
        </span>
      </p>
      <p className="d-flex my-3 gap-3">
        <span className="text-gray-dark">权益算力(封装算力 * {priorityRate}%)</span>
        <span className="ms-auto">
          <span className="fs-16 fw-600">{formatPower(investorPower)?.[0]}</span>
          <span className="text-gray-dark ms-1">{formatPower(investorPower)?.[1]}</span>
        </span>
      </p>
      <p className="d-flex my-3 gap-3">
        <span className="text-gray-dark">可提余额</span>
        <span className="ms-auto">
          <span className="fs-16 fw-600">{formatAmount(reward)}</span>
          <span className="text-gray-dark ms-1">FIL</span>
        </span>
      </p>
    </>
  );
}
