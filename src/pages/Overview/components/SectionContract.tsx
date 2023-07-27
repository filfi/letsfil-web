import { Input } from 'antd';
import { useMemo } from 'react';
import { getAddress } from 'viem';
import classNames from 'classnames';

import { SCAN_URL } from '@/constants';
import SpinBtn from '@/components/SpinBtn';
import ShareBtn from '@/components/ShareBtn';
import useContract from '@/hooks/useContract';
import useRaiseBase from '@/hooks/useRaiseBase';
import useRaiseRole from '@/hooks/useRaiseRole';
import useRaiseState from '@/hooks/useRaiseState';
import useProcessify from '@/hooks/useProcessify';
import { ReactComponent as IconCopy } from '@/assets/icons/copy-06.svg';
import { ReactComponent as IconShare } from '@/assets/icons/link-external-02.svg';

const SectionContract: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { backOwner } = useContract(data?.raise_address);

  const { hasOwner, refetch } = useRaiseBase(data);
  const { isRaiser, isSigned, isServicer } = useRaiseRole(data);
  const { isClosed, isFailed, isDestroyed, isPending } = useRaiseState(data);

  const address = useMemo(() => (data?.raise_address ? getAddress(data.raise_address) : ''), [data?.raise_address]);
  const canRestore = useMemo(() => isServicer && (isClosed || isFailed || isDestroyed), [isClosed, isFailed, isDestroyed, isServicer]);

  const handleSign = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();

    const target = document.querySelector('#card-action');

    target?.scrollIntoView({ behavior: 'smooth' });
  };

  const [backing, handleBack] = useProcessify(async () => {
    await backOwner();

    await refetch();
  });

  if (!data) return null;

  if (isPending) {
    return (
      <div className="card section-card">
        <div className="card-body d-flex">
          <div className="flex-shrink-0">
            <span className="bi bi-info-circle"></span>
          </div>
          <div className="flex-grow-1 ms-3">
            <p className="mb-1 fw-600">节点计划还未部署到智能合约，需要主办人签名</p>
            <p className="mb-0">新创建的节点计划可以修改，便于达成共识。主办人签名后，节点计划将永久部署在链上，不可更改。</p>
            {isRaiser && (
              <p className="mt-2 mb-0 fw-600">
                <span className="me-2">在哪里签名？</span>
                <a className="btn btn-link p-0 shadow-none" href="#card-action" onClick={handleSign}>
                  <span className="me-1">去签名</span>
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
              <p className="fw-500 mb-2">FilFi智能合约接管 {data.miner_id}</p>
              <p className="text-gray mb-0">{hasOwner ? '恢复为原始Owner' : '已恢复为原始Owner'}</p>
            </div>
            {hasOwner ? (
              <SpinBtn className="btn btn-primary my-auto" loading={backing} onClick={handleBack}>
                收回 {data.miner_id} 的Owner权限
              </SpinBtn>
            ) : (
              <span className="badge badge-success my-auto">已收回 {data.miner_id} 的Owner权限</span>
            )}
          </div>
        </div>
      ) : (
        <div className="card mb-3">
          <div className="card-body d-flex">
            <div className="flex-grow-1 me-3">
              <p className="fw-500 mb-0">{data.miner_id} 移交给FilFi智能合约</p>
              {!isSigned && <p className="text-gray mt-2 mb-0">需要技术服务商完成签名</p>}
            </div>
            <span className={classNames('badge my-auto', isSigned ? 'badge-success' : 'badge-warning')}>{isSigned ? '已移交' : '未移交'}</span>
          </div>
        </div>
      )}

      <div>
        <label className="form-label">此节点计划的智能合约地址</label>
        <div className="input-group">
          <Input className="form-control" readOnly value={address} />

          <ShareBtn className="btn btn-outline-light" text={address}>
            <IconCopy />
          </ShareBtn>

          <a className="btn btn-outline-light" target="_blank" rel="noreferrer" href={address ? `${SCAN_URL}/address/${address}` : undefined}>
            <IconShare />
          </a>
        </div>
      </div>
    </>
  );
};

export default SectionContract;
