import { useMemo } from 'react';
import { Pie, PieConfig } from '@ant-design/plots';

import { formatNum } from '@/utils/format';
import { accDiv, accMul } from '@/utils/utils';
import useChainInfo from '@/hooks/useChainInfo';
import useRaiseInfo from '@/hooks/useRaiseInfo';
import useRaiseRate from '@/hooks/useRaiseRate';
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
  color: ['#2699FB', '#7FC4FD', '#9FD3FD', '#BCE0FD'],
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

const SectionReward: React.FC<ItemProps> = ({ data }) => {
  const { perFil, perPledge } = useChainInfo();
  const { period, target, isRaiser, isServicer } = useRaiseInfo(data);
  const { priorityRate, raiserRate, opsRatio, ffiRate } = useRaiseRate(data);

  // 预估节点激励 = 24小时产出效率 * 封装天数 * 总算力(节点目标 / 当前扇区质押量)
  const reward = useMemo(() => accMul(perFil, period, accDiv(target, perPledge)), [perFil, period, perPledge, target]);
  const pieData = useMemo(
    () => [
      { name: '参建者权益', value: priorityRate },
      { name: '建设者权益', value: raiserRate },
      { name: '技术运维服务费', value: opsRatio },
      { name: 'FilFi协议费用', value: ffiRate },
    ],
    [priorityRate, raiserRate, opsRatio, ffiRate],
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
          <div className="row g-2">
            <div className="col-6 col-md-7">
              <div className="reward-item mb-3">
                <span className="reward-dot reward-dot-circle"></span>
                <p className="reward-label">{period}天总节点激励(估)</p>
                <p className="reward-text">
                  <span className="text-decimal text-uppercase">{formatNum(reward, '0.0a')}</span>
                  <span className="ms-2 text-neutral">FIL</span>
                </p>
              </div>
            </div>
            <div className="col-6 col-md-5">
              <div className="reward-item mb-3" style={{ '--dot-color': '#2699FB' } as any}>
                <span className="reward-dot"></span>
                <p className="reward-label">参建者</p>
                <p className="reward-text">
                  <span className="text-decimal">{priorityRate}</span>
                  <span className="ms-2 text-neutral">%</span>
                </p>
              </div>
            </div>
            <div className="col-6 col-md-4">
              <div className="reward-item mb-3" style={{ '--dot-color': '#7FC4FD' } as any}>
                <span className="reward-dot"></span>
                <p className="reward-label">建设者</p>
                <p className="reward-text">
                  <span className="text-decimal">{raiserRate}</span>
                  <span className="ms-2 text-neutral">%</span>
                </p>
              </div>
            </div>
            <div className="col-6 col-md-4">
              <div className="reward-item mb-3" style={{ '--dot-color': '#9FD3FD' } as any}>
                <span className="reward-dot"></span>
                <p className="reward-label">技术运维服务费</p>
                <p className="reward-text">
                  <span className="text-decimal">{opsRatio}</span>
                  <span className="ms-2 text-neutral">%</span>
                </p>
              </div>
            </div>
            <div className="col-12 col-md-4">
              <div className="reward-item mb-3" style={{ '--dot-color': '#BCE0FD' } as any}>
                <span className="reward-dot"></span>
                <p className="reward-label">FilFi协议费用</p>
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
            <div className="col-4 table-cell th">每个参建者</div>
            <div className="col-8 table-cell">获得节点激励的{priorityRate}%</div>
          </div>
        </div>
        <div className="col table-row">
          <div className="row g-0">
            <div className="col-4 table-cell th">分配时间</div>
            <div className="col-8 table-cell">实时分账随时提取</div>
          </div>
        </div>
        <div className="col table-row">
          <div className="row g-0">
            <div className="col-4 table-cell th">Gas费</div>
            <div className="col-8 table-cell">由建设者承担</div>
          </div>
        </div>
        <div className="col table-row">
          <div className="row g-0">
            <div className="col-4 table-cell th">我的角色</div>
            <div className="col-8 table-cell">
              {isServicer ? (
                <>
                  <span className="d-inline-block p-1 rounded-circle" style={{ backgroundColor: '#9FD3FD' }}></span>
                  <span className="ms-1">技术服务商</span>
                </>
              ) : isRaiser ? (
                <>
                  <span className="d-inline-block p-1 rounded-circle" style={{ backgroundColor: '#7FC4FD' }}></span>
                  <span className="ms-1">建设者</span>
                </>
              ) : (
                <>
                  <span className="d-inline-block p-1 rounded-circle" style={{ backgroundColor: '#2699FB' }}></span>
                  <span className="ms-1">参建者</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SectionReward;
