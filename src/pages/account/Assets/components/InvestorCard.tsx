import { Skeleton } from 'antd';
import { history } from '@umijs/max';

import SpinBtn from '@/components/SpinBtn';
import ShareBtn from '@/components/ShareBtn';
import useAssetPack from '@/hooks/useAssetPack';
import useRaiseDetail from '@/hooks/useRaiseDetail';
import useRewardInvestor from '@/hooks/useRewardInvestor';
import useDepositInvestor from '@/hooks/useDepositInvestor';
import { formatAmount, formatID, formatPower } from '@/utils/format';
import { ReactComponent as IconHD } from '@/assets/icons/hard-drive.svg';
import { ReactComponent as IconShare } from '@/assets/icons/share-04.svg';

export type ItemProps = {
  pack: API.Pack;
};

export default function CardInvestor({ pack }: React.PropsWithChildren<ItemProps>) {
  const { data: plan, isLoading } = useRaiseDetail(pack.raising_id);

  const { reward } = useRewardInvestor(plan);
  const { amount } = useDepositInvestor(plan);
  const { investPower, investRate, sealsPower } = useAssetPack(plan, pack);

  const handleWithdraw = () => {
    history.push(`/assets/${pack.raising_id}`);
  };

  return (
    <div className="col">
      <div className="card h-100">
        <div className="card-header d-flex align-items-center">
          <div className="flex-shrink-0">
            <IconHD />
          </div>

          <div className="flex-grow-1">
            <h4 className="card-title mb-0 mx-2 text-break text-uppercase">
              {formatID(pack.asset_pack_id)}@{pack.miner_id}
            </h4>
          </div>

          <div className="flex-shrink-0">
            <ShareBtn className="btn border-0 p-0 ms-auto" text={`${location.origin}/assets/${pack.raising_id}`}>
              <IconShare />
            </ShareBtn>
          </div>
        </div>
        <div className="card-body py-1">
          <Skeleton active loading={isLoading}>
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
              <span className="text-gray-dark">权益算力(封装算力 * {investRate}%)</span>
              <span className="ms-auto">
                <span className="fs-16 fw-600">{formatPower(investPower)?.[0]}</span>
                <span className="text-gray-dark ms-1">{formatPower(investPower)?.[1]}</span>
              </span>
            </p>
            <p className="d-flex my-3 gap-3">
              <span className="text-gray-dark">可提余额</span>
              <span className="ms-auto">
                <span className="fs-16 fw-600">{formatAmount(reward)}</span>
                <span className="text-gray-dark ms-1">FIL</span>
              </span>
            </p>
          </Skeleton>
        </div>
        <div className="card-footer d-flex">
          <SpinBtn className="btn btn-primary ms-auto" disabled={isLoading || reward <= 0} onClick={handleWithdraw}>
            提取余额
          </SpinBtn>
        </div>
      </div>
    </div>
  );
}
