import { useMemo } from 'react';
import { Skeleton } from 'antd';
import { history } from '@umijs/max';

import RaiserCard from './RaiserCard';
import OpsFundCard from './OpsFundCard';
import InvestorCard from './InvestorCard';
import ServicerCard from './ServicerCard';
import { formatID } from '@/utils/format';
import SpinBtn from '@/components/SpinBtn';
import ShareBtn from '@/components/ShareBtn';
import useRaiseInfo from '@/hooks/useRaiseInfo';
import useRaiseRole from '@/hooks/useRaiseRole';
import useDepositInvestor from '@/hooks/useDepositInvestor';
import { ReactComponent as IconHD } from '@/assets/icons/hard-drive.svg';
import { ReactComponent as IconShare } from '@/assets/icons/share-04.svg';

const AssetCard: React.FC<{ pack: API.Pack; plan?: API.Plan | null; type: number }> = ({ pack, plan, type }) => {
  const handleWithdraw = () => {
    history.push(`/assets/${pack.raising_id}`);
  };

  const renderBadge = () => {
    switch (type) {
      case 1:
        return <span className="badge badge-success my-auto me-3">主办人</span>;
      case 2:
        return <span className="badge badge-primary my-auto me-3">技术服务商</span>;
      case 3:
        return <span className="badge badge-primary my-auto me-3">运维保证金</span>;
    }

    return null;
  };

  const renderContent = () => {
    switch (type) {
      case 1:
        return <RaiserCard pack={pack} plan={plan} />;
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
            <ShareBtn className="btn border-0 p-0 ms-auto" text={`${location.origin}/assets/${pack.raising_id}`} toast="链接已复制">
              <IconShare />
            </ShareBtn>
          </div>
        </div>
        <div className="card-body py-1">{renderContent()}</div>
        <div className="card-footer d-flex">
          {renderBadge()}
          <SpinBtn className="btn btn-primary ms-auto" onClick={handleWithdraw}>
            提取余额
          </SpinBtn>
        </div>
      </div>
    </div>
  );
};

const AssetItem: React.FC<{ data: API.Pack }> = ({ data }) => {
  const { data: plan, isLoading } = useRaiseInfo(data.raising_id);

  const { isInvestor, isLoading: isILoading } = useDepositInvestor(plan);
  const { isRaiser, isServicer } = useRaiseRole(plan);

  const roles = useMemo(() => [isInvestor, isRaiser, isServicer], [isInvestor, isRaiser, isServicer]);

  const renderCard = (role: boolean, type: number) => {
    if (role) {
      if (type === 2) {
        return (
          <>
            <AssetCard key={`${data.miner_id}-${data.raising_id}-2`} pack={data} plan={plan} type={2} />
            <AssetCard key={`${data.miner_id}-${data.raising_id}-3`} pack={data} plan={plan} type={3} />
          </>
        );
      }

      return <AssetCard key={`${data.miner_id}-${data.raising_id}-${type}`} pack={data} plan={plan} type={type} />;
    }

    return null;
  };

  if (isLoading || isILoading) {
    return (
      <div className="col">
        <div className="card h-100">
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
