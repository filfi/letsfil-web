import { useMemo } from 'react';
import classNames from 'classnames';
import { NavLink } from '@umijs/max';

import RaiseActions from './RaiseActions';
import PageHeader from '@/components/PageHeader';
import useRaiseRole from '@/hooks/useRaiseRole';
import useRaiseState from '@/hooks/useRaiseState';
import { formatID, formatSponsor } from '@/utils/format';
import useDepositInvestor from '@/hooks/useDepositInvestor';

const RaiseHeader: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { isInvestor } = useDepositInvestor(data);
  const { isRaiser, isServicer } = useRaiseRole(data);
  const { isDestroyed, isSuccess } = useRaiseState(data);

  const showAsset = useMemo(
    () => (isDestroyed || isSuccess) && (isInvestor || isRaiser || isServicer),
    [isInvestor, isRaiser, isServicer, isDestroyed, isSuccess],
  );

  return (
    <>
      <PageHeader
        className={classNames({ 'border-bottom': !showAsset, 'mb-3 pb-0': showAsset })}
        title={data ? `${formatSponsor(data.sponsor_company)}发起的节点计划@${data.miner_id}` : '-'}
        desc={
          isDestroyed || isSuccess ? <span className="text-uppercase">算力包 {formatID(data?.raising_id)}</span> : '依靠强大的FVM智能合约，合作共建Filecoin存储'
        }
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
              节点计划
            </NavLink>
          </li>
        </ul>
      )}
    </>
  );
};

export default RaiseHeader;
