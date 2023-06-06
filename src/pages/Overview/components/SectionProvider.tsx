import classNames from 'classnames';

import Avatar from '@/components/Avatar';
import { formatSponsor } from '@/utils/format';
import useRaiseDetail from '@/hooks/useRaiseDetail';

const SectionProvider: React.FC = () => {
  const { data, state, provider } = useRaiseDetail();
  const { isPending } = state;

  return (
    <>
      <div className="table-row w-100">
        <div className="row g-0 p-0">
          <div className="col-12 col-lg-3 d-none d-lg-table-cell table-cell th">主办人</div>
          <div className="col-12 col-lg-9 table-cell">
            <div className="d-flex align-items-center flex-wrap gap-3">
              <div className="d-flex align-items-center me-auto">
                <div className="flex-shrink-0">
                  <Avatar size={32} src={data?.sponsor_logo} />
                </div>
                <div className="flex-grow-1 ms-2">
                  <p className="mb-0">{formatSponsor(data?.sponsor_company)}</p>
                  <p className="mb-0 text-gray d-lg-none">主办人</p>
                </div>
              </div>
              <p className="d-flex flex-column flex-lg-row align-items-start gap-1 mb-0">
                <span className={classNames('badge', data && !isPending ? 'badge-success' : 'badge-danger')}>{data && !isPending ? '已签名' : '待签名'}</span>
                <span className={classNames('badge', ['badge-danger', 'badge-success'][data?.raise_margin_status ?? 0])}>
                  主办人保证金·{['待缴', '已付'][data?.raise_margin_status ?? 0]}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="table-row w-100">
        <div className="row g-0 p-0">
          <div className="col-12 col-lg-3 d-none d-lg-table-cell table-cell table-cell th">技术服务商</div>
          <div className="col-12 col-lg-9 table-cell">
            <div className="d-flex align-items-center flex-wrap gap-3">
              <div className="d-flex align-items-center me-auto">
                <div className="flex-shrink-0">
                  <Avatar size={32} src={provider?.logo_url} />
                </div>
                <div className="flex-grow-1 ms-2">
                  <p className="mb-0">{provider?.full_name}</p>
                  <p className="mb-0 text-gray d-lg-none">技术服务商</p>
                  {/* <p className="mb-0 text-gray-dark">{F.formatAddr(provider.wallet_address)}</p> */}
                </div>
              </div>
              <p className="d-flex flex-column flex-lg-row align-items-start gap-1 mb-0">
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
