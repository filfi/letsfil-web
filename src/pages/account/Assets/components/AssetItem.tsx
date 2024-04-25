import { useMemo } from 'react';
import { Skeleton } from 'antd';
import { Link } from '@umijs/max';

import OpsFundCard from './OpsFundCard';
import SponsorCard from './SponsorCard';
import InvestorCard from './InvestorCard';
import ServicerCard from './ServicerCard';
import { formatID } from '@/utils/format';
import { isMountPlan } from '@/helpers/mount';
import ShareBtn from '@/components/ShareBtn';
import useAssetPack from '@/hooks/useAssetPack';
import useRaiseInfo from '@/hooks/useRaiseInfo';
import { ReactComponent as IconHD } from '@/assets/icons/hard-drive.svg';
import { ReactComponent as IconShare } from '@/assets/icons/share-04.svg';

const AssetCard: React.FC<{ pack: API.Pack; plan?: API.Plan | null; type: number }> = ({ pack, plan, type }) => {
  const isLeverage = useMemo(() => pack.PledgeList && pack.PledgeList.length > 0, [pack.PledgeList]);

  const renderBadge = () => {
    switch (type) {
      case 1:
        return <span className="badge badge-success my-auto me-3">主辦人</span>;
      case 2:
        return <span className="badge badge-primary my-auto me-3">技術服務商</span>;
      case 3:
        return <span className="badge badge-primary my-auto me-3">運維保證金</span>;
    }

    return null;
  };

  const renderContent = () => {
    switch (type) {
      case 1:
        return <SponsorCard pack={pack} plan={plan} />;
      case 2:
        return <ServicerCard pack={pack} plan={plan} />;
      case 3:
        return <OpsFundCard pack={pack} plan={plan} />;
      default:
        return <InvestorCard pack={pack} plan={plan} />;
    }
  };

  return (
    <div className="col">
      <div className="card">
        <div className="card-header d-flex align-items-center">
          <div className="flex-shrink-0">
            <IconHD />
          </div>

          <div className="flex-grow-1">
            <h4 className="card-title mb-0 mx-2 text-break">
              {formatID(pack.asset_pack_id)}@{pack.miner_id}
            </h4>
          </div>

          <div className="flex-shrink-0">
            <ShareBtn
              className="btn border-0 p-0 ms-auto"
              text={
                isLeverage
                  ? `${location.origin}/assets/leverage/${pack.raising_id}`
                  : `${location.origin}/assets/overview/${pack.raising_id}`
              }
              toast="連結已複製"
            >
              <IconShare />
            </ShareBtn>
          </div>
        </div>

        {renderContent()}

        <div className="card-footer d-flex">
          {renderBadge()}

          <Link
            className="btn btn-primary ms-auto"
            to={isLeverage ? `/assets/leverage/${pack.raising_id}` : `/assets/overview/${pack.raising_id}`}
          >
            提取餘額
          </Link>
        </div>
      </div>
    </div>
  );
};

const AssetItem: React.FC<{ data: API.Pack }> = ({ data }) => {
  const { data: plan, isLoading } = useRaiseInfo(data.raising_id);

  const { isInvestor, isRaiser, isServicer } = useAssetPack(plan);

  const roles = useMemo(() => [isInvestor, isRaiser, isServicer], [isInvestor, isRaiser, isServicer]);

  const renderCard = (role: boolean, type: number) => {
    if (role) {
      if (type === 2) {
        return (
          <>
            <AssetCard key={`${data.miner_id}-${data.raising_id}-2`} pack={data} plan={plan} type={2} />
            {!isMountPlan(plan) && (
              <AssetCard key={`${data.miner_id}-${data.raising_id}-3`} pack={data} plan={plan} type={3} />
            )}
          </>
        );
      }

      return <AssetCard key={`${data.miner_id}-${data.raising_id}-${type}`} pack={data} plan={plan} type={type} />;
    }

    return null;
  };

  if (isLoading) {
    return (
      <div className="col">
        <div className="card">
          <div className="card-header d-flex">
            <Skeleton.Avatar active size={24} />
            <Skeleton className="ms-2 my-auto" active title={false} paragraph={{ className: 'mb-0', rows: 1 }} />
          </div>
          <div className="card-body">
            <Skeleton active paragraph={{ rows: 3 }} />
          </div>
          <div className="card-footer d-flex">
            <Skeleton.Button className="ms-auto" active />
          </div>
        </div>
      </div>
    );
  }

  return <>{roles.map(renderCard)}</>;
};

export default AssetItem;
