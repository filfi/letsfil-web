import { Input } from 'antd';
import { useMemo } from 'react';
import classNames from 'classnames';

import { SCAN_URL } from '@/constants';
import Modal from '@/components/Modal';
import { toF4Address } from '@/utils/utils';
import ShareBtn from '@/components/ShareBtn';
import useRaiseDetail from '@/hooks/useRaiseDetail';
import { ReactComponent as IconCopy } from '@/assets/icons/copy-06.svg';
import { ReactComponent as IconShare } from '@/assets/icons/link-external-02.svg';

const SectionContract: React.FC = () => {
  const { data, info, state } = useRaiseDetail();
  const { hasOwner, isRaiser, isSigned, isServicer } = info;
  const { isClosed, isFailed, isDestroyed, isPending } = state;

  const canRestore = useMemo(() => isServicer && (isClosed || isFailed || isDestroyed), [isClosed, isFailed, isDestroyed, isServicer]);

  const handleSign = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();

    const target = document.querySelector('#card-action');

    target?.scrollIntoView({ behavior: 'smooth' });
  };

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
              <button className="btn btn-primary" type="button" data-bs-toggle="modal" data-bs-target="#restore-modal">
                收回 {data.miner_id} 的Owner权限
              </button>
            ) : (
              <span className="badge badge-success my-auto">已收回 {data.miner_id} 的Owner权限</span>
            )}
          </div>
        </div>
      ) : (
        <div className="card mb-3">
          <div className="card-body d-flex">
            <div className="flex-grow-1 me-3">
              <p className="fw-500 mb-2">{data.miner_id} 移交给FilFi智能合约</p>
              {!isSigned && <p className="text-gray mb-0">需要技术服务商完成签名</p>}
            </div>
            <span className={classNames('badge my-auto', isSigned ? 'badge-success' : 'badge-warning')}>{isSigned ? '已移交' : '未移交'}</span>
          </div>
        </div>
      )}

      <div>
        <label className="form-label">智能合约地址</label>
        <div className="input-group">
          <Input className="form-control" readOnly value={data.raise_address} />

          <ShareBtn className="btn btn-outline-light" text={data.raise_address}>
            <IconCopy />
          </ShareBtn>

          <a
            className="btn btn-outline-light"
            target="_blank"
            rel="noreferrer"
            href={data.raise_address ? `${SCAN_URL}/address/${data.raise_address}` : undefined}
          >
            <IconShare />
          </a>
        </div>
      </div>

      <Modal.Alert id="restore-modal" title={`收回 ${data.miner_id ?? ''} 的Owner权限`}>
        <div className="p-3">
          <p className="mb-0 fs-16 fw-500">
            <span>在安全环境下执行以下命令，将智能合约地址修改为Owner地址。</span>
          </p>

          <div className="p-2 border rounded-1 my-4">
            <div className="d-flex align-items-start bg-dark rounded-1 p-2">
              <span className="flex-shrink-0 text-white fw-600">$</span>
              <div className="flex-grow-1 mx-2 fw-600 text-wrap text-success">
                lotus-miner actor set-owner --really-do-it &lt;ownerAddress&gt; {toF4Address(data.raise_address)}
              </div>
              <ShareBtn className="btn p-0" text={`lotus-miner actor set-owner --really-do-it <ownerAddress> ${toF4Address(data.raise_address)}`}>
                <IconCopy />
              </ShareBtn>
            </div>
          </div>
        </div>
      </Modal.Alert>
    </>
  );
};

export default SectionContract;
