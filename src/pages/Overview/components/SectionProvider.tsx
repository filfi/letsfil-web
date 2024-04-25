import { useMemo } from 'react';
import classNames from 'classnames';
import { useModel } from '@umijs/max';

import Avatar from '@/components/Avatar';
import { isMountPlan } from '@/helpers/mount';
import useSProvider from '@/hooks/useSProvider';
import useMountState from '@/hooks/useMountState';
import { formatAddr, formatSponsor } from '@/utils/format';

const SectionProvider: React.FC = () => {
  const { plan, state } = useModel('Overview.overview');

  const { isPending } = state;
  const { isStarted } = useMountState(plan);
  const provider = useSProvider(plan?.service_id);
  const isMount = useMemo(() => isMountPlan(plan), [plan]);

  return (
    <>
      <div className="table-row w-100">
        <div className="row g-0 p-0">
          <div className="col-12 col-lg-3 d-none d-lg-table-cell table-cell th">主辦人</div>
          <div className="col-12 col-lg-9 table-cell">
            <div className="d-flex align-items-center flex-wrap gap-3">
              <div className="d-flex align-items-center me-auto">
                <div className="flex-shrink-0">
                  <Avatar address={plan?.raiser} size={32} src={plan?.sponsor_logo} />
                </div>
                <div className="flex-grow-1 ms-2">
                  <p className="mb-0">{formatSponsor(plan?.sponsor_company)}</p>
                  <p className="mb-0 text-gray d-lg-none">主辦人</p>
                </div>
              </div>
              <p className="d-flex flex-column flex-lg-row align-items-start gap-1 mb-0">
                {isMount ? (
                  <span className={classNames('badge', plan && isStarted ? 'badge-success' : 'badge-danger')}>
                    {plan && isStarted ? '已簽名' : '待簽名'}
                  </span>
                ) : (
                  <>
                    <span className={classNames('badge', plan && !isPending ? 'badge-success' : 'badge-danger')}>
                      {plan && !isPending ? '已簽名' : '待簽名'}
                    </span>
                    <span
                      className={classNames('badge', ['badge-danger', 'badge-success'][plan?.raise_margin_status ?? 0])}
                    >
                      主辦人保證金·{['待缴', '已付'][plan?.raise_margin_status ?? 0]}
                    </span>
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="table-row w-100">
        <div className="row g-0 p-0">
          <div className="col-12 col-lg-3 d-none d-lg-table-cell table-cell table-cell th">技術服務商</div>
          <div className="col-12 col-lg-9 table-cell">
            <div className="d-flex align-items-center flex-wrap gap-3">
              <div className="d-flex align-items-center me-auto">
                <div className="flex-shrink-0">
                  <Avatar address={provider?.wallet_address} size={32} src={provider?.logo_url} />
                </div>
                <div className="flex-grow-1 ms-2">
                  <p className="mb-0">{provider?.full_name || formatAddr(provider?.wallet_address)}</p>
                  <p className="mb-0 text-gray d-lg-none">技術服務商</p>
                  {/* <p className="mb-0 text-gray-dark">{F.formatAddr(provider.wallet_address)}</p> */}
                </div>
              </div>
              <p className="d-flex flex-column flex-lg-row align-items-start gap-1 mb-0">
                <span className={classNames('badge', ['badge-danger', 'badge-success'][plan?.sp_sign_status ?? 0])}>
                  {['待簽名', '已簽名'][plan?.sp_sign_status ?? 0]}
                </span>

                {!isMount && (
                  <span className={classNames('badge', ['badge-danger', 'badge-success'][plan?.sp_margin_status ?? 0])}>
                    運維保證金·{['待繳', '已付'][plan?.sp_margin_status ?? 0]}
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SectionProvider;
