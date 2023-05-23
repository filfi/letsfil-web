import { Input } from 'antd';
import classNames from 'classnames';

import { SCAN_URL } from '@/constants';
import ShareBtn from '@/components/ShareBtn';
import useRaiseState from '@/hooks/useRaiseState';
import { ReactComponent as IconCopy } from '@/assets/icons/copy-06.svg';
import { ReactComponent as IconShare } from '@/assets/icons/link-external-02.svg';

const SectionContract: React.FC<{ data?: API.Plan }> = ({ data }) => {
  const { isPending, isRaiser, isSigned } = useRaiseState(data);

  const handleSign = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();

    const target = document.querySelector('#card-action');

    target?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isPending) {
    return (
      <div className="card section-card">
        <div className="card-body d-flex">
          <div className="flex-shrink-0">
            <span className="bi bi-info-circle"></span>
          </div>
          <div className="flex-grow-1 ms-3">
            <p className="mb-1 fw-600">募集计划还未部署到智能合约，需要发起人签名</p>
            <p className="mb-0">新创建的募集计划可以修改，便于达成共识。发起人签名后，募集计划将永久部署在链上，不可更改。</p>
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
      <div className="card mb-3">
        <div className="card-body d-flex">
          <div className="flex-grow-1 me-3">
            <p className="fw-500 mb-2">{data?.miner_id}移交给FilFi智能合约</p>
            {!isSigned && <p className="text-gray mb-0">需要技术服务商完成签名</p>}
          </div>
          <span className={classNames('badge my-auto', isSigned ? 'badge-success' : 'badge-warning')}>{isSigned ? '已移交' : '未移交'}</span>
        </div>
      </div>

      <div>
        <label className="form-label">智能合约地址</label>
        <div className="input-group">
          <Input className="form-control" readOnly value={data?.raise_address} />

          <ShareBtn className="btn btn-outline-light" text={data?.raise_address}>
            <IconCopy />
          </ShareBtn>

          <a
            className="btn btn-outline-light"
            target="_blank"
            rel="noreferrer"
            href={data && data.raise_address ? `${SCAN_URL}/address/${data.raise_address}` : undefined}
          >
            <IconShare />
          </a>
        </div>
      </div>
    </>
  );
};

export default SectionContract;
