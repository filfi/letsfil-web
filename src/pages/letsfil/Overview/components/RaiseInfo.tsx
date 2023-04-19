import { useMemo } from 'react';

import * as U from '@/utils/utils';
import * as F from '@/utils/format';
import useProvider from '@/hooks/useProvider';
import useDepositInvest from '@/hooks/useDepositInvest';

function formatIncome(rate?: number | string) {
  return F.formatPercent(rate).replace(/%$/, '');
}

const RaiseInfo: React.FC<{ data?: API.Plan }> = ({ data }) => {
  const { getProvider } = useProvider();

  const { totalPledge } = useDepositInvest(data?.raise_address);

  const total = useMemo(() => F.toNumber(data?.target_amount), [data]);
  const actual = useMemo(() => F.toNumber(data?.actual_amount), [data]);
  const percent = useMemo(() => (total > 0 ? totalPledge / total : 0), [total, totalPledge]);
  const provider = useMemo(() => (data?.service_id ? getProvider(data.service_id) : undefined), [data]);

  return (
    <>
      <div className="row row-cols-1 row-cols-md-2 g-3 mb-3 mb-lg-4">
        <div className="col">
          <div className="card h-100">
            <div className="card-body">
              <p className="mb-1 text-gray-dark">计划募集</p>
              <p className="mb-0 d-flex align-items-center">
                <span className="fs-5 fw-bold">
                  <span className="fs-3">{F.formatNum(total, '0a')}</span>
                  <span className="ms-1 text-neutral">FIL</span>
                </span>
                <span className="badge badge-success ms-auto">已募{F.formatRate(percent)}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className="card h-100">
            <div className="card-body">
              <p className="mb-1 text-gray-dark">年化收益（预估）</p>
              <p className="mb-0 d-flex flex-wrap align-items-center text-break">
                <span className="fs-5 fw-bold">
                  <span className="fs-3">{formatIncome(data?.income_rate || 0)}</span>
                  <span className="ms-1 text-neutral">%</span>
                </span>
                {/* <span className="badge badge-primary ms-auto">
                  {isRaiser ? data?.raiser_share : isProvider ? data?.servicer_share : data?.investor_share}% · 总产出
                </span> */}
              </p>
            </div>
          </div>
        </div>
      </div>

      {data && (
        <div className="table-responsive">
          <table className="table">
            <tbody>
              <tr>
                <th>发起人</th>
                <td width="32%">
                  {!!data.sponsor_company && (
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <img src={require('../imgs/avatar.png')} height={32} alt="Avatar" />
                      </div>
                      <div className="flex-grow-1 ms-2">
                        <p className="mb-0">{data.sponsor_company}</p>
                        <p className="mb-0 text-gray-dark">{F.formatAddr(data?.raiser)}</p>
                      </div>
                    </div>
                  )}
                </td>
                <th>服务商</th>
                <td width="32%">
                  {provider && (
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <img src={provider.logo_url} height={32} alt="Avatar" />
                      </div>
                      <div className="flex-grow-1 ms-2">
                        <p className="mb-0">{provider.full_name}</p>
                        {/* <p className="mb-0 text-gray-dark">{F.formatAddr(provider.wallet_address)}</p> */}
                      </div>
                    </div>
                  )}
                </td>
              </tr>
              <tr>
                <th>募集目标</th>
                <td>{F.formatNum(total, '0a')} FIL</td>
                <th>{data?.status > 3 ? '实际募集' : '最小募集比例'}</th>
                <td>{data?.status > 3 ? `${F.formatNum(actual, '0a')} FIL` : `${data?.min_raise_rate ?? '-'}%`}</td>
              </tr>
              <tr>
                <th>募集保证金</th>
                <td>5%</td>
                <th>运维保证金</th>
                <td>5%</td>
              </tr>
              <tr>
                <th>截止日期</th>
                <td>{F.formatSecDate(data.closing_time)}</td>
                <th>距截止还有</th>
                <td>{U.diffDays(data.closing_time)}</td>
              </tr>
              <tr>
                <th>预期封装完成</th>
                <td>{F.formatSecDate(data.end_seal_time)}</td>
                <th>封装时间</th>
                <td>{U.sec2day(data.seal_time_limit)}天</td>
              </tr>
              <tr>
                <th>扇区到期(估)</th>
                <td>{F.formatRemain(data.end_seal_time, data.sector_period)}</td>
                <th>扇区期限</th>
                <td>{U.sec2day(data.sector_period)}天</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};

export default RaiseInfo;
