import { useMemo } from 'react';
import classNames from 'classnames';
import { useRequest } from 'ahooks';
import { NavLink } from '@umijs/max';

import PageHeader from '../PageHeader';
import { getExtInfo } from '@/apis/packs';
import useAccount from '@/hooks/useAccount';
import useAssetPack from '@/hooks/useAssetPack';
import useMountState from '@/hooks/useMountState';
import { formatID, formatSponsor } from '@/utils/format';

import type { AssetsHeaderProps } from './types';

const MountHeader: React.FC<AssetsHeaderProps> = ({ data, extra }) => {
  const { address } = useAccount();
  const { isWorking } = useMountState(data);
  const { isInvestor, isRaiser, isServicer } = useAssetPack(data);

  const service = async () => {
    if (address && data) {
      return await getExtInfo(data.raising_id, address);
    }
  };

  const { data: ext } = useRequest(service, { refreshDeps: [address, data] });

  const showAsset = useMemo(
    () => isWorking && (isInvestor || isRaiser || isServicer),
    [isInvestor, isRaiser, isServicer, isWorking],
  );

  const renderLinks = () => {
    const hasPledge = ext?.has_direct_pledge;
    const hasLevers = ext?.has_leverage_pledge;
    const isOverview = hasPledge || isRaiser || isServicer;

    if (isOverview && hasLevers) {
      return (
        <>
          <li className="nav-item">
            <NavLink className="nav-link" to={`/assets/overview/${data?.raising_id}`}>
              我的資產（直接質押）
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to={`/assets/leverage/${data?.raising_id}`}>
              我的資產（槓桿質押）
            </NavLink>
          </li>
        </>
      );
    }

    if (hasLevers) {
      return (
        <li className="nav-item">
          <NavLink className="nav-link" to={`/assets/leverage/${data?.raising_id}`}>
            我的資產
          </NavLink>
        </li>
      );
    }

    if (isOverview) {
      return (
        <li className="nav-item">
          <NavLink className="nav-link" to={`/assets/overview/${data?.raising_id}`}>
            我的資產
          </NavLink>
        </li>
      );
    }
  };

  if (!data) return null;

  return (
    <>
      <PageHeader
        className={classNames({ 'border-bottom': !showAsset, 'mb-3 pb-0': showAsset })}
        title={`${formatSponsor(data.sponsor_company)}掛載節點@${data.miner_id}`}
        desc={isWorking ? `算力包 ${formatID(data.raising_id)}` : '將歷史節點的分配計畫委託給FilFi智能合約'}
      >
        {extra}
      </PageHeader>

      {showAsset && (
        <ul className="nav nav-tabs ffi-tabs mb-3 mb-lg-4">
          {renderLinks()}
          <li className="nav-item">
            <NavLink className="nav-link" to={`/overview/${data.raising_id}`}>
              分配計劃
            </NavLink>
          </li>
        </ul>
      )}
    </>
  );
};

export default MountHeader;
