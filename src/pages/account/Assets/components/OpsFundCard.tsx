import { useMemo } from 'react';

import useAssetPack from '@/hooks/useAssetPack';
import useRaiseBase from '@/hooks/useRaiseBase';
import useRaiseRate from '@/hooks/useRaiseRate';
import useRaiseSeals from '@/hooks/useRaiseSeals';
import { accDiv, accMul, accSub } from '@/utils/utils';
import { formatAmount, formatPower } from '@/utils/format';

export type ItemProps = {
  pack: API.Pack;
  plan?: API.Plan | null;
};

export default function OpsFundCard({ pack, plan }: React.PropsWithChildren<ItemProps>) {
  const { actual } = useRaiseBase(plan);
  const { progress } = useRaiseSeals(plan);
  const { opsRatio, priorityRate } = useRaiseRate(plan);
  const { pledge, power, opsPower } = useAssetPack(plan, pack);

  // 实际保证金配比：运维保证金配比 = 运维保证金 / (运维保证金 + 已集合质押金额)
  const opsAmount = useMemo(() => accDiv(accMul(actual, accDiv(opsRatio, 100)), accSub(1, accDiv(opsRatio, 100))), [actual, opsRatio]);
  const ratio = useMemo(() => (pledge > 0 ? Math.min(Math.max(accDiv(accMul(opsAmount, progress), pledge), 0), 1) : 0), [pledge, opsAmount]);
  const sealsPower = useMemo(() => accMul(power, ratio), [power, ratio]);

  return (
    <>
      <p className="d-flex my-3 gap-3">
        <span className="text-gray-dark">质押</span>
        <span className="ms-auto">
          <span className="fs-16 fw-600">{formatAmount(opsAmount)}</span>
          <span className="text-gray-dark ms-1">FIL</span>
        </span>
      </p>
      <p className="d-flex my-3 gap-3">
        <span className="text-gray-dark">封装算力</span>
        <span className="ms-auto">
          <span className="fs-16 fw-600">{formatPower(sealsPower)?.[0]}</span>
          <span className="text-gray-dark ms-1">{formatPower(sealsPower)?.[1]}</span>
        </span>
      </p>
      <p className="d-flex my-3 gap-3">
        <span className="text-gray-dark">权益算力(封装算力 * {priorityRate}%)</span>
        <span className="ms-auto">
          <span className="fs-16 fw-600">{formatPower(opsPower)?.[0]}</span>
          <span className="text-gray-dark ms-1">{formatPower(opsPower)?.[1]}</span>
        </span>
      </p>
      <p className="d-flex my-3 gap-3">
        <span className="text-gray-dark">可提余额</span>
        <span className="ms-auto">
          <span className="fs-16 fw-600">0</span>
          <span className="text-gray-dark ms-1">FIL</span>
        </span>
      </p>
    </>
  );
}
