import { useMemo } from 'react';

import RaiserCard from './RaiserCard';
import InvestorCard from './InvestorCard';
import ServicerCard from './ServicerCard';
import useRaiseRole from '@/hooks/useRaiseRole';
import useRaiseDetail from '@/hooks/useRaiseDetail';
import useDepositInvestor from '@/hooks/useDepositInvestor';

const AssetItem: React.FC<{ data: API.Pack }> = ({ data }) => {
  const { data: info } = useRaiseDetail(data.raising_id);

  const { isInvestor } = useDepositInvestor(info);
  const { isRaiser, isServicer } = useRaiseRole(info);

  const roles = useMemo(() => [isInvestor, isRaiser, isServicer], [isInvestor, isRaiser, isServicer]);

  const renderItem = (role: boolean, type: number) => {
    if (role) {
      switch (type) {
        case 1:
          return <RaiserCard key={type} pack={data} />;
        case 2:
          return <ServicerCard key={type} pack={data} />;
        default:
          return <InvestorCard key={type} pack={data} />;
      }
    }

    return null;
  };

  return <>{roles.map(renderItem)}</>;
};

export default AssetItem;
