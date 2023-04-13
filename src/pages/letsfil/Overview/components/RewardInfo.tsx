import { useMemo } from 'react';
import { Pie, PieConfig } from '@ant-design/plots';

import * as U from '@/utils/utils';
import { formatAmount, toNumber } from '@/utils/format';

const RewardInfo: React.FC<{ data?: API.Base }> = ({ data }) => {
  const pieData = useMemo(
    () => [
      { name: '投资人权益', value: +`${data?.investor_share || 0}` },
      { name: '募集人权益', value: +`${data?.raiser_share || 0}` },
      { name: '服务商权益', value: +`${data?.servicer_share || 0}` },
    ],
    [data],
  );

  const days = useMemo(() => U.sec2day(data?.sector_period), [data]);
  const rate = useMemo(() => toNumber(data?.income_rate, 6), [data]);
  const target = useMemo(() => toNumber(data?.target_amount), [data]);
  const reward = useMemo(() => U.accDiv(U.accMul(U.accMul(rate, target), days), 360), [data]);

  const config: PieConfig = {
    width: 120,
    height: 120,
    data: pieData,
    colorField: 'name',
    angleField: 'value',
    radius: 1,
    innerRadius: 0.5,
    legend: false,
    label: false,
    color: ['#2699FB', '#7FC4FD', '#BCE0FD'],
    statistic: {
      title: false,
      content: false,
    },
    tooltip: {
      formatter(item) {
        return { name: item.name, value: item.value + '%' };
      },
    },
  };

  return (
    <>
      <div className="row g-3 g-lg-4 mb-3">
        <div className="col-12 col-md-4 col-xl-3">
          <div style={{ width: 120, height: 120 }}>
            <Pie {...config} />
          </div>
        </div>
        <div className="col-12 col-md-8 col-xl-9">
          <div className="reward-item mb-3">
            <span className="reward-dot reward-dot-circle"></span>
            <p className="reward-label">{days}天总奖励(估)</p>
            <p className="reward-text">
              <span className="reward-decimal">{formatAmount(reward)}</span>
              <span className="ms-2 text-neutral">FIL</span>
            </p>
          </div>

          <div className="row row-cols-3">
            <div className="col">
              <div className="reward-item mb-3">
                <span className="reward-dot"></span>
                <p className="reward-label">投资人权益</p>
                <p className="reward-text">
                  <span className="reward-decimal">{data?.investor_share}</span>
                  <span className="ms-2 text-neutral">%</span>
                </p>
              </div>
            </div>
            <div className="col">
              <div className="reward-item mb-3" style={{ '--dot-color': '#7FC4FD' } as any}>
                <span className="reward-dot"></span>
                <p className="reward-label">募集人权益</p>
                <p className="reward-text">
                  <span className="reward-decimal">{data?.raiser_share}</span>
                  <span className="ms-2 text-neutral">%</span>
                </p>
              </div>
            </div>
            <div className="col">
              <div className="reward-item mb-3" style={{ '--dot-color': '#BCE0FD' } as any}>
                <span className="reward-dot"></span>
                <p className="reward-label">服务商权益</p>
                <p className="reward-text">
                  <span className="reward-decimal">{data?.servicer_share}</span>
                  <span className="ms-2 text-neutral">%</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table">
          <tbody>
            <tr>
              <th>FIL奖励</th>
              <td width="35%">按照初始投入比例分配</td>
              <th>分配方式</th>
              <td width="35%">用户自提</td>
            </tr>
            <tr>
              <th>质押币</th>
              <td>按照初始投入返还</td>
              <th>返还时间</th>
              <td>扇区到期返还</td>
            </tr>
            <tr>
              <th>Gas费</th>
              <td>按照初始投入比例承担</td>
              <th>扇区期限</th>
              <td>{days}天</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default RewardInfo;
