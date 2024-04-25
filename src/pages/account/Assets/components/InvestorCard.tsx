import { Tooltip } from 'antd';

import LoanCard from './LoanCard';
import { isMountPlan } from '@/helpers/mount';
import useAssetPack from '@/hooks/useAssetPack';
import useMountAssets from '@/hooks/useMountAssets';
import useRewardInvestor from '@/hooks/useRewardInvestor';
import { formatAmount, formatPower } from '@/utils/format';

export type ItemProps = {
  pack: API.Pack;
  plan?: API.Plan | null;
};

const MountInvestor: React.FC<ItemProps> = ({ plan }) => {
  const { reward } = useRewardInvestor(plan);
  const { investorPledge, investorPower } = useMountAssets(plan);

  return (
    <div className="card-body py-1">
      <p className="d-flex my-3 gap-3">
        <span className="text-gray-dark">我的質押</span>
        <span className="ms-auto">
          <span className="fs-16 fw-600">{formatAmount(investorPledge)}</span>
          <span className="text-gray-dark ms-1">FIL</span>
        </span>
      </p>

      <p className="d-flex my-3 gap-3">
        <span className="text-gray-dark">
          <span className="me-1">我的算力</span>

          <Tooltip title="依照掛載節點時的約定">
            <span className="bi bi-question-circle"></span>
          </Tooltip>
        </span>
        <span className="ms-auto">
          <span className="fs-16 fw-600">{formatPower(investorPower)?.[0]}</span>
          <span className="text-gray-dark ms-1">{formatPower(investorPower)?.[1]}</span>
        </span>
      </p>

      <p className="d-flex my-3 gap-3">
        <span className="text-gray-dark">可提餘額</span>
        <span className="ms-auto">
          <span className="fs-16 fw-600">{formatAmount(reward)}</span>
          <span className="text-gray-dark ms-1">FIL</span>
        </span>
      </p>
    </div>
  );
};

const RaiseInvestor: React.FC<ItemProps> = ({ pack, plan }) => {
  const { reward } = useRewardInvestor(plan);
  const { investorRate, pledge, pledgeSealsPower, pledgePower, leverage, leverageSealsPower } = useAssetPack(
    plan,
    pack,
  );

  const renderLoanContent = () => {
    if (pack.PledgeList && pack.PledgeList.length) {
      return <LoanCard list={pack.PledgeList} amount={leverage} rate={investorRate} power={leverageSealsPower} />;
    }

    return null;
  };

  return (
    <>
      <div className="card-body py-1">
        <p className="d-flex my-3 gap-3">
          <span className="text-gray-dark">我的質押</span>
          <span className="ms-auto">
            <span className="fs-16 fw-600">{formatAmount(pledge)}</span>
            <span className="text-gray-dark ms-1">FIL</span>
          </span>
        </p>
        {!isMountPlan(plan) && (
          <p className="d-flex my-3 gap-3">
            <span className="text-gray-dark">封裝算力</span>
            <span className="ms-auto">
              <span className="fs-16 fw-600">{formatPower(pledgeSealsPower)?.[0]}</span>
              <span className="text-gray-dark ms-1">{formatPower(pledgeSealsPower)?.[1]}</span>
            </span>
          </p>
        )}
        <p className="d-flex my-3 gap-3">
          <span className="text-gray-dark">
            <span className="me-1">我的算力</span>

            <Tooltip title={`我的算力 = 封裝算力 * ${investorRate}%`}>
              <span className="bi bi-question-circle"></span>
            </Tooltip>
          </span>
          <span className="ms-auto">
            <span className="fs-16 fw-600">{formatPower(pledgePower)?.[0]}</span>
            <span className="text-gray-dark ms-1">{formatPower(pledgePower)?.[1]}</span>
          </span>
        </p>
        <p className="d-flex my-3 gap-3">
          <span className="text-gray-dark">可提餘額</span>
          <span className="ms-auto">
            <span className="fs-16 fw-600">{formatAmount(reward)}</span>
            <span className="text-gray-dark ms-1">FIL</span>
          </span>
        </p>
      </div>

      {renderLoanContent()}
    </>
  );
};

export default function CardInvestor({ pack, plan }: React.PropsWithChildren<ItemProps>) {
  if (isMountPlan(plan)) {
    return <MountInvestor pack={pack} plan={plan} />;
  }

  return <RaiseInvestor pack={pack} plan={plan} />;
}
