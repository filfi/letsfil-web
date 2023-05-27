import { useMemo } from 'react';
import { Pie, PieConfig } from '@ant-design/plots';

import * as U from '@/utils/utils';
import type { ItemProps } from './types';

const config: PieConfig = {
  data: [],
  width: 120,
  height: 120,
  colorField: 'name',
  angleField: 'value',
  radius: 1,
  innerRadius: 0.5,
  legend: false,
  label: false,
  color: ['#2699FB', '#BCE0FD'],
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

const SectionCoin: React.FC<ItemProps> = ({ data }) => {
  // 保证金部分
  const opsRate = useMemo(() => data?.ops_security_fund_rate ?? 5, [data?.ops_security_fund_rate]);
  // 投资人部分
  const investRate = useMemo(() => U.accSub(100, opsRate), [opsRate]);

  const pieData = useMemo(
    () => [
      { name: '投资人', value: investRate },
      { name: '技术运维保证金', value: opsRate },
    ],
    [investRate, opsRate],
  );

  return (
    <>
      <div className="row g-3 g-lg-4 mb-3 g-0">
        <div className="col-12 col-md-4 col-xl-3">
          <div style={{ width: 120, height: 120 }}>
            <Pie {...config} data={pieData} />
          </div>
        </div>
        <div className="col-12 col-md-8 col-xl-9">
          <div className="row row-cols-2 g-2">
            <div className="col">
              <div className="reward-item mb-3">
                <span className="reward-dot"></span>
                <p className="reward-label">投资人(优先质押币)</p>
                <p className="reward-text">
                  <span className="text-decimal">{investRate}</span>
                  <span className="ms-2 text-neutral">%</span>
                </p>
              </div>
            </div>
            <div className="col">
              <div className="reward-item mb-3">
                <span className="reward-dot"></span>
                <p className="reward-label">技术运维保证金(劣后质押币)</p>
                <p className="reward-text">
                  <span className="text-decimal">{opsRate}</span>
                  <span className="ms-2 text-neutral">%</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-1 row-cols-xl-2 g-0">
        <div className="col table-row">
          <div className="row g-0">
            <div className="col-4 table-cell th">所有权</div>
            <div className="col-8 table-cell">永恒不变，全额返还</div>
          </div>
        </div>
        <div className="col table-row">
          <div className="row g-0">
            <div className="col-4 table-cell th">返还时间</div>
            <div className="col-8 table-cell">扇区到期后即可提取</div>
          </div>
        </div>
        <div className="col table-row">
          <div className="row g-0">
            <div className="col-4 table-cell th">优先质押币</div>
            <div className="col-8 table-cell">优先分配，优先返还</div>
          </div>
        </div>
        <div className="col table-row">
          <div className="row g-0">
            <div className="col-4 table-cell th">劣后质押币</div>
            <div className="col-8 table-cell">优先受罚，最后返还</div>
          </div>
        </div>
      </div>
      <div className="table-row w-100">
        <div className="row g-0">
          <div className="col-4 col-md-2 col-lg-4 col-xl-2 table-cell th">承诺比例</div>
          <div className="col-8 col-md-10 col-lg-8 col-xl-10 table-cell">按募集金额等比例配比保证金，始终保持保证金占比{opsRate}%</div>
        </div>
      </div>
    </>
  );
};

export default SectionCoin;
