import { useMemo } from 'react';
import { Pie, PieConfig } from '@ant-design/plots';

import { formatNum } from '@/utils/format';
import { accDiv, accMul } from '@/utils/utils';
import useRaiseInfo from '@/hooks/useRaiseInfo';
import useRaiseRate from '@/hooks/useRaiseRate';
import useIncomeRate from '@/hooks/useIncomeRate';
import useRaiseState from '@/hooks/useRaiseState';
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

const SectionReward: React.FC<ItemProps> = ({ data }) => {
  const { rate } = useIncomeRate(data);
  const { isSuccess } = useRaiseState(data);
  const { actual, target, isRaiser, isServicer } = useRaiseInfo(data);
  const { priorityRate, investRate, raiserRate, servicerRate, opsRatio, ffiRate, period } = useRaiseRate(data);
  // 预估收益
  const reward = useMemo(() => accDiv(accMul(isSuccess ? actual : target, rate, period), 360), [isSuccess, target, actual, rate, period]);

  const pieData = useMemo(
    () => [
      { name: '投资人权益', value: priorityRate },
      { name: '发起人权益', value: raiserRate },
      { name: '服务商权益', value: servicerRate },
    ],
    [priorityRate, raiserRate, servicerRate],
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
          <div className="row row-cols-3 g-2">
            <div className="col">
              <div className="reward-item mb-3">
                <span className="reward-dot reward-dot-circle"></span>
                <p className="reward-label">{period}天总奖励(估)</p>
                <p className="reward-text">
                  <span className="text-decimal text-uppercase">{formatNum(reward, '0.0a')}</span>
                  <span className="ms-2 text-neutral">FIL</span>
                </p>
              </div>
            </div>
            <div className="col">
              <div className="reward-item mb-3">
                <span className="reward-dot"></span>
                <p className="reward-label">投资人</p>
                <p className="reward-text">
                  <span className="text-decimal">{priorityRate}</span>
                  <span className="ms-2 text-neutral">%</span>
                </p>
              </div>
            </div>
            <div className="col">
              <div className="reward-item mb-3" style={{ '--dot-color': '#7FC4FD' } as any}>
                <span className="reward-dot"></span>
                <p className="reward-label">发起人</p>
                <p className="reward-text">
                  <span className="text-decimal">{raiserRate}</span>
                  <span className="ms-2 text-neutral">%</span>
                </p>
              </div>
            </div>
            <div className="col">
              <div className="reward-item mb-3">
                <span className="reward-dot"></span>
                <p className="reward-label">技术运维服务费</p>
                <p className="reward-text">
                  <span className="text-decimal">{opsRatio}</span>
                  <span className="ms-2 text-neutral">%</span>
                </p>
              </div>
            </div>
            <div className="col">
              <div className="reward-item mb-3">
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
            <div className="col-4 table-cell th">每个投资人</div>
            <div className="col-8 table-cell">按投入占比分享投资人的{investRate}%</div>
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
            <div className="col-8 table-cell">由发起人承担</div>
          </div>
        </div>
        <div className="col table-row">
          <div className="row g-0">
            <div className="col-4 table-cell th">我的角色</div>
            <div className="col-8 table-cell">
              {isServicer ? (
                <>
                  <span className="d-inline-block p-1 rounded-circle" style={{ backgroundColor: '#BCE0FD' }}></span>
                  <span className="ms-1">技术服务商</span>
                </>
              ) : isRaiser ? (
                <>
                  <span className="d-inline-block p-1 rounded-circle" style={{ backgroundColor: '#7FC4FD' }}></span>
                  <span className="ms-1">发起人</span>
                </>
              ) : (
                <>
                  <span className="d-inline-block p-1 rounded-circle" style={{ backgroundColor: '#2699FB' }}></span>
                  <span className="ms-1">投资人</span>
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
