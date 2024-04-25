import { useMemo } from 'react';
import { useModel } from '@umijs/max';
import { Pie, PieConfig } from '@ant-design/plots';

import { accSub } from '@/utils/utils';
import { formatAmount } from '@/utils/format';

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
  color: ['#2699FB', '#7FC4FD'],
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

const SectionPledge: React.FC = () => {
  const {
    assets: { total },
    rate: { opsRatio },
    state: { isSuccess },
  } = useModel('Overview.overview');

  const investRate = useMemo(() => Math.max(accSub(100, opsRatio), 0), [opsRatio]);

  const pieData = useMemo(
    () => [
      { name: '優先建設者', value: investRate },
      { name: '運維保證金', value: opsRatio },
    ],
    [investRate, opsRatio],
  );

  return (
    <>
      <div className="row g-3 g-lg-4 mb-3 g-0">
        <div className="col-12 col-md-4 col-xxl-3">
          <div className="mb-3" style={{ height: 120 }}>
            <Pie {...config} data={pieData} />
          </div>
        </div>
        <div className="col-12 col-md-8 col-xxl-9">
          <div className="row g-2">
            <div className="col-6 col-lg-5 col-xxl-6">
              <div className="reward-item mb-3" style={{ '--dot-color': '#2699FB' } as any}>
                <span className="reward-dot"></span>
                <p className="reward-label">優先質押</p>
                <p className="reward-text">
                  <span className="text-decimal">{investRate}</span>
                  <span className="ms-2 text-neutral">%</span>
                </p>
              </div>
            </div>
            <div className="col-6 col-lg-7 col-xxl-6">
              <div className="reward-item mb-3" style={{ '--dot-color': '#7FC4FD' } as any}>
                <span className="reward-dot"></span>
                <p className="reward-label">劣後質押(運維保證金)</p>
                <p className="reward-text">
                  <span className="text-decimal">{opsRatio}</span>
                  <span className="ms-2 text-neutral">%</span>
                </p>
              </div>
            </div>
            {isSuccess && (
              <div className="col-12">
                <div className="reward-item mb-3">
                  <span className="reward-dot reward-dot-circle"></span>
                  <p className="reward-label">質押總和(優先質押+劣後質押)</p>
                  <p className="reward-text">
                    <span className="text-decimal">{formatAmount(total, 2, 2)}</span>
                    <span className="ms-2 text-neutral">FIL</span>
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-1 row-cols-xl-2 g-0">
        <div className="col table-row">
          <div className="row g-0">
            <div className="col-4 table-cell th">所有權</div>
            <div className="col-8 table-cell">永恆不變，全額返還</div>
          </div>
        </div>
        <div className="col table-row">
          <div className="row g-0">
            <div className="col-4 table-cell th">返還時間</div>
            <div className="col-8 table-cell">扇區到期後即可提取</div>
          </div>
        </div>
        <div className="col table-row">
          <div className="row g-0">
            <div className="col-4 table-cell th">優先質押</div>
            <div className="col-8 table-cell">優先分配，優先返還</div>
          </div>
        </div>
        <div className="col table-row">
          <div className="row g-0">
            <div className="col-4 table-cell th">劣後質押</div>
            <div className="col-8 table-cell">優先受罰，最後返還</div>
          </div>
        </div>
      </div>
      <div className="table-row w-100">
        <div className="row g-0">
          <div className="col-4 col-md-2 col-lg-4 col-xl-2 table-cell th">保证金比例</div>
          <div className="col-8 col-md-10 col-lg-8 col-xl-10 table-cell">
            以質押金額等比例配比保證金，始終保持保證金佔比{opsRatio}%
          </div>
        </div>
      </div>
    </>
  );
};

export default SectionPledge;
