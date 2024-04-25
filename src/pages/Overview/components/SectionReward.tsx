import { useMemo } from 'react';
import { useModel } from '@umijs/max';
import { Pie, PieConfig } from '@ant-design/plots';

import { isMountPlan } from '@/helpers/mount';

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
  color: ['#2699FB', '#7FC4FD', '#9FD3FD', '#BCE0FD'],
  statistic: {
    title: {
      content: '算力',
      style: {
        color: '#475467',
        fontFamily: 'Inter',
        fontSize: '14px',
        fontWeight: '400',
      },
    },
    content: false,
  },
  tooltip: {
    formatter(item) {
      return { name: item.name, value: item.value + '%' };
    },
  },
};

const SectionReward: React.FC = () => {
  const { assets, plan, rate } = useModel('Overview.overview');
  const { isInvestor, isRaiser, isServicer } = assets;
  const { priorityRate, superRate, servicerRate, ffiRate } = rate;

  const roles = useMemo(() => {
    return [
      { role: isRaiser, color: '#7FC4FD', name: '主辦人' },
      { role: isServicer, color: '#9FD3FD', name: '技術服務商' },
      { role: isInvestor, color: '#2699FB', name: '建設者' },
    ].filter((i) => i.role);
  }, [isRaiser, isServicer, isInvestor]);
  const isMount = useMemo(() => isMountPlan(plan), [plan]);
  const pieData = useMemo(
    () => [
      { name: '建設者權益', value: priorityRate },
      { name: '主辦人權益', value: superRate },
      { name: '技術運維服務費', value: servicerRate },
      { name: 'FilFi協議費用', value: ffiRate },
    ],
    [priorityRate, superRate, servicerRate, ffiRate],
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
            <div className="col-6 col-md-12 col-lg-6 col-xxl-12">
              <div className="reward-item mb-3" style={{ '--dot-color': '#2699FB' } as any}>
                <span className="reward-dot"></span>
                <p className="reward-label">建設者</p>
                <p className="reward-text">
                  <span className="text-decimal">{priorityRate}</span>
                  <span className="ms-2 text-neutral">%</span>
                </p>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-6 col-xxl-4">
              <div className="reward-item mb-3" style={{ '--dot-color': '#7FC4FD' } as any}>
                <span className="reward-dot"></span>
                <p className="reward-label">主辦人</p>
                <p className="reward-text">
                  <span className="text-decimal">{superRate}</span>
                  <span className="ms-2 text-neutral">%</span>
                </p>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-6 col-xxl-4">
              <div className="reward-item mb-3" style={{ '--dot-color': '#9FD3FD' } as any}>
                <span className="reward-dot"></span>
                <p className="reward-label">技術運維服務費</p>
                <p className="reward-text">
                  <span className="text-decimal">{servicerRate}</span>
                  <span className="ms-2 text-neutral">%</span>
                </p>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-6 col-xxl-4">
              <div className="reward-item mb-3" style={{ '--dot-color': '#BCE0FD' } as any}>
                <span className="reward-dot"></span>
                <p className="reward-label">FilFi協議費用</p>
                <p className="reward-text">
                  <span className="text-decimal">{ffiRate}</span>
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
            <div className="col-4 table-cell th">建設者</div>
            <div className="col-8 table-cell">獲得算力的{priorityRate}%</div>
          </div>
        </div>
        <div className="col table-row">
          <div className="row g-0">
            <div className="col-4 table-cell th">分配時間</div>
            <div className="col-8 table-cell">實時分帳隨時提領</div>
          </div>
        </div>
        {isMount ? (
          <div className="col table-row">
            <div className="row g-0">
              <div className="col-4 table-cell th">質押</div>
              <div className="col-8 table-cell">100%建設者持有</div>
            </div>
          </div>
        ) : (
          <div className="col table-row">
            <div className="row g-0">
              <div className="col-4 table-cell th">封裝Gas費</div>
              <div className="col-8 table-cell">由主辦人承擔</div>
            </div>
          </div>
        )}
        <div className="col table-row">
          <div className="row g-0">
            <div className="col-4 table-cell th">我的角色</div>
            <div className="col-8 table-cell">
              {roles.length ? (
                roles.map(({ color, name }, i) => (
                  <span key={i}>
                    <span className="d-inline-block p-1 rounded-circle" style={{ backgroundColor: color }} />
                    <span className="ms-1">{name}</span>

                    {i < roles.length - 1 && <span className="mx-1">·</span>}
                  </span>
                ))
              ) : (
                <span className="text-gray">-</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SectionReward;
