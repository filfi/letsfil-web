import { Input } from 'antd';
import { useMemo } from 'react';
import { getAddress } from 'viem';
import classNames from 'classnames';
import { useModel } from '@umijs/max';

import { SCAN_URL } from '@/constants';
import SpinBtn from '@/components/SpinBtn';
import ShareBtn from '@/components/ShareBtn';
import { isMountPlan } from '@/helpers/mount';
import useContract from '@/hooks/useContract';
import useProcessify from '@/hooks/useProcessify';
import { ReactComponent as IconCopy } from '@/assets/icons/copy-06.svg';
import { ReactComponent as IconShare } from '@/assets/icons/link-external-02.svg';

const SectionContract: React.FC = () => {
  const { base, plan, role, state } = useModel('Overview.overview');
  const { backOwner } = useContract(plan?.raise_address);

  const { hasOwner, refetch } = base;
  const { isRaiser, isSigned, isServicer } = role;
  const { isClosed, isFailed, isDestroyed, isPending } = state;

  const isMount = useMemo(() => isMountPlan(plan), [plan]);
  const address = useMemo(() => (plan?.raise_address ? getAddress(plan.raise_address) : ''), [plan?.raise_address]);
  const canRestore = useMemo(
    () => isServicer && (isClosed || isFailed || isDestroyed),
    [isClosed, isFailed, isDestroyed, isServicer],
  );

  const handleSign = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();

    const target = document.querySelector('#card-action');

    target?.scrollIntoView({ behavior: 'smooth' });
  };

  const [backing, handleBack] = useProcessify(async () => {
    await backOwner();

    await refetch?.();
  });

  if (!plan) return null;

  const name = isMount ? '分配計劃' : '節點計劃';

  if (isPending) {
    return (
      <div className="card section-card">
        <div className="card-body d-flex">
          <div className="flex-shrink-0">
            <span className="bi bi-info-circle"></span>
          </div>
          <div className="flex-grow-1 ms-3">
            <p className="mb-1 fw-600">{name}還未部署到智能合約，需要主辦人簽名</p>
            <p className="mb-0">
              新創建的{name}可以修改，以便達成共識。 主辦人簽名後，{name}將永久部署在鏈上，不可更改。
            </p>
            {isRaiser && (
              <p className="mt-2 mb-0 fw-600">
                <span className="me-2">在哪裡簽名？</span>
                <a className="btn btn-link p-0 shadow-none" href="#card-action" onClick={handleSign}>
                  <span className="me-1">去簽名</span>
                  <span className="bi bi-arrow-right"></span>
                </a>
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {canRestore ? (
        <div className="card mb-3">
          <div className="card-body d-flex">
            <div className="flex-grow-1 me-3">
              <p className="fw-500 mb-2">FilFi智能合約接管 {plan.miner_id}</p>
              <p className="text-gray mb-0">{hasOwner ? '恢復為原始Owner' : '已恢復為原始Owner'}</p>
            </div>
            {hasOwner ? (
              <SpinBtn className="btn btn-primary my-auto" loading={backing} onClick={handleBack}>
                收回 {plan.miner_id} 的Owner權限
              </SpinBtn>
            ) : (
              <span className="badge badge-success my-auto">已收回 {plan.miner_id} 的Owner權限</span>
            )}
          </div>
        </div>
      ) : (
        <div className="card mb-3">
          <div className="card-body d-flex">
            <div className="flex-grow-1 me-3">
              <p className="fw-500 mb-0">{plan.miner_id} 交給FilFi智能合約</p>
              {!isSigned && <p className="text-gray mt-2 mb-0">需要技術服務提供者完成簽名</p>}
            </div>
            <span className={classNames('badge my-auto', isSigned ? 'badge-success' : 'badge-warning')}>
              {isSigned ? '已移交' : '未移交'}
            </span>
          </div>
        </div>
      )}

      <div>
        <label className="form-label">此{name}的智能合約地址</label>
        <div className="input-group">
          <Input className="form-control" readOnly value={address} />

          <ShareBtn className="btn btn-outline-light" text={address}>
            <IconCopy />
          </ShareBtn>

          <a
            className="btn btn-outline-light"
            target="_blank"
            rel="noreferrer"
            href={address ? `${SCAN_URL}/address/${address}` : undefined}
          >
            <IconShare />
          </a>
        </div>
      </div>
    </>
  );
};

export default SectionContract;
