import { useMemo } from 'react';
import { Pie, PieConfig } from '@ant-design/plots';

import * as U from '@/utils/utils';
import useRaiseState from '@/hooks/useRaiseState';
import { formatNum, toNumber } from '@/utils/format';

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

const SectionReward: React.FC<{ data?: API.Plan }> = ({ data }) => {
  const { isRaiser, isServicer } = useRaiseState(data);
  const days = useMemo(() => data?.sector_period ?? 0, [data?.sector_period]);
  const rate = useMemo(() => toNumber(data?.income_rate, 6), [data?.income_rate]);
  const target = useMemo(() => toNumber(data?.target_amount), [data?.target_amount]);
  const reward = useMemo(() => U.accDiv(U.accMul(U.accMul(rate, target), days), 360), [days, rate, target]);
  // 优先部分
  const priorityRate = useMemo(() => data?.raiser_coin_share ?? 70, [data?.raiser_coin_share]);
  // 劣后部分
  const inferiorityRate = useMemo(() => U.accSub(100, priorityRate), [priorityRate]);
  // 保证金占比
  const opsRatio = useMemo(() => data?.ops_security_fund_rate ?? 5, [data?.ops_security_fund_rate]);
  // 投资人部分
  const investRate = useMemo(() => U.accMul(priorityRate, U.accDiv(U.accSub(100, opsRatio), 100)), [priorityRate, opsRatio]);
  // 保证金部分
  const opsRate = useMemo(() => U.accMul(priorityRate, U.accDiv(opsRatio, 100)), [priorityRate, opsRatio]);
  // 服务商权益
  const servicerRate = useMemo(() => data?.op_server_share ?? 5, [data?.op_server_share]);
  // filfi 协议部分
  const ffiRate = useMemo(() => U.accMul(inferiorityRate, 0.08), [inferiorityRate]);
  // 发起人部分
  const raiserRate = useMemo(() => U.accSub(U.accSub(inferiorityRate, ffiRate), servicerRate), [inferiorityRate, ffiRate, servicerRate]);

  const pieData = useMemo(
    () => [
      { name: '投资人权益', value: investRate },
      { name: '发起人权益', value: raiserRate },
      { name: '服务商权益', value: servicerRate },
    ],
    [investRate, raiserRate, servicerRate],
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
                <p className="reward-label">{days}天总奖励(估)</p>
                <p className="reward-text">
                  <span className="text-decimal text-uppercase">{formatNum(reward, '0a')}</span>
                  <span className="ms-2 text-neutral">FIL</span>
                </p>
              </div>
            </div>
            <div className="col">
              <div className="reward-item mb-3">
                <span className="reward-dot"></span>
                <p className="reward-label">投资人</p>
                <p className="reward-text">
                  <span className="text-decimal">{investRate}</span>
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
                <p className="reward-label">技术运维保证金</p>
                <p className="reward-text">
                  <span className="text-decimal">{opsRate}</span>
                  <span className="ms-2 text-neutral">%</span>
                </p>
              </div>
            </div>
            <div className="col">
              <div className="reward-item mb-3" style={{ '--dot-color': '#BCE0FD' } as any}>
                <span className="reward-dot"></span>
                <p className="reward-label">技术运维服务商</p>
                <p className="reward-text">
                  <span className="text-decimal">{servicerRate}</span>
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
