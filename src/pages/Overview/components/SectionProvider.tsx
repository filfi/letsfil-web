import { Avatar } from 'antd';
import { useMemo } from 'react';
import classNames from 'classnames';

import useProvider from '@/hooks/useProvider';
import useRaiseState from '@/hooks/useRaiseState';

const SectionProvider: React.FC<{ data?: API.Plan }> = ({ data }) => {
  const { getProvider } = useProvider();

  const { isPending } = useRaiseState(data);
  const provider = useMemo(() => getProvider(data?.service_id), [data]);

  return (
    <>
      <div className="table-row w-100">
        <div className="row g-0 p-0">
          <div className="col-3 table-cell th">发起人</div>
          <div className="col-9 table-cell">
            <div className="d-flex align-items-center">
              <div className="d-flex align-items-center me-3">
                <div className="flex-shrink-0">
                  <Avatar size={32} src={data?.sponsor_logo} />
                </div>
                <div className="flex-grow-1 ms-2">
                  <p className="mb-0">{data?.sponsor_company}</p>
                </div>
              </div>
              <p className="mb-0 ms-auto d-flex gap-1">
                <span className={classNames('badge', data && !isPending ? 'badge-success' : 'badge-danger')}>{data && !isPending ? '已签名' : '待签名'}</span>
                <span className={classNames('badge', ['badge-danger', 'badge-success'][data?.raise_margin_status ?? 0])}>
                  募集保证金·{['待缴', '已付'][data?.raise_margin_status ?? 0]}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="table-row w-100">
        <div className="row g-0 p-0">
          <div className="col-3 table-cell th">技术服务商</div>
          <div className="col-9 table-cell">
            <div className="d-flex align-items-center">
              <div className="d-flex align-items-center me-3">
                <div className="flex-shrink-0">
                  <Avatar size={32} src={provider?.logo_url} />
                </div>
                <div className="flex-grow-1 ms-2">
                  <p className="mb-0">{provider?.full_name}</p>
                  {/* <p className="mb-0 text-gray-dark">{F.formatAddr(provider.wallet_address)}</p> */}
                </div>
              </div>
              <p className="mb-0 ms-auto d-flex gap-1">
                <span className={classNames('badge', ['badge-danger', 'badge-success'][data?.sp_sign_status ?? 0])}>
                  {['待签名', '已签名'][data?.sp_sign_status ?? 0]}
                </span>
                <span className={classNames('badge', ['badge-danger', 'badge-success'][data?.sp_margin_status ?? 0])}>
                  技术运维保证金·{['待缴', '已付'][data?.sp_margin_status ?? 0]}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SectionProvider;
