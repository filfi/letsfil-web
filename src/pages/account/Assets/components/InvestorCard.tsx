import { Tooltip } from 'antd';

import useAssetPack from '@/hooks/useAssetPack';
import useRaiseRate from '@/hooks/useRaiseRate';
import useRewardInvestor from '@/hooks/useRewardInvestor';
import { formatAmount, formatPower } from '@/utils/format';

export type ItemProps = {
  pack: API.Pack;
  plan?: API.Plan | null;
};

export default function CardInvestor({ pack, plan }: React.PropsWithChildren<ItemProps>) {
  const { priorityRate } = useRaiseRate(plan);
  const { reward } = useRewardInvestor(plan);
  const { investorAmount, investorPower, investorSealsPower } = useAssetPack(plan, pack);

  return (
    <>
      <p className="d-flex my-3 gap-3">
        <span className="text-gray-dark">我的质押</span>
        <span className="ms-auto">
          <span className="fs-16 fw-600">{formatAmount(investorAmount)}</span>
          <span className="text-gray-dark ms-1">FIL</span>
        </span>
      </p>
      <p className="d-flex my-3 gap-3">
        <span className="text-gray-dark">封装算力</span>
        <span className="ms-auto">
          <span className="fs-16 fw-600">{formatPower(investorSealsPower)?.[0]}</span>
          <span className="text-gray-dark ms-1">{formatPower(investorSealsPower)?.[1]}</span>
        </span>
      </p>
      <p className="d-flex my-3 gap-3">
        <span className="text-gray-dark">
          <span className="me-1">我的算力</span>

          <Tooltip title={`我的算力 = 封装算力 * ${priorityRate}%`}>
            <span className="bi bi-question-circle"></span>
          </Tooltip>
        </span>
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
