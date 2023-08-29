import { useMemo } from 'react';
import classNames from 'classnames';
import { NavLink } from '@umijs/max';

import RaiseActions from './RaiseActions';
import PageHeader from '@/components/PageHeader';
import useRaiseRole from '@/hooks/useRaiseRole';
import useMountState from '@/hooks/useMountState';
import { formatID, formatSponsor } from '@/utils/format';
import useDepositInvestor from '@/hooks/useDepositInvestor';

const MountHeader: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { isWorking } = useMountState(data);
  const { isInvestor } = useDepositInvestor(data);
  const { isRaiser, isServicer } = useRaiseRole(data);

  const showAsset = useMemo(() => isWorking && (isInvestor || isRaiser || isServicer), [isInvestor, isRaiser, isServicer, isWorking]);

  return (
    <>
      <PageHeader
        className={classNames({ 'border-bottom': !showAsset, 'mb-3 pb-0': showAsset })}
        title={data ? `${formatSponsor(data.sponsor_company)}挂载节点@${data.miner_id}` : '-'}
        desc={isWorking ? <span className="text-uppercase">算力包 {formatID(data?.raising_id)}</span> : '将历史节点的分配计划委托给FilFi智能合约'}
      >
        <div className="d-flex align-items-center gap-3 text-nowrap">
          <RaiseActions data={data} />
        </div>
      </PageHeader>

      {showAsset && (
        <ul className="nav nav-tabs ffi-tabs mb-3 mb-lg-4">
          <li className="nav-item">
            <NavLink className="nav-link" to={`/assets/${data?.raising_id}`}>
              我的资产
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink className="nav-link" to={`/overview/${data?.raising_id}`}>
              分配计划
            </NavLink>
          </li>
        </ul>
      )}
    </>
  );
};

export default MountHeader;
