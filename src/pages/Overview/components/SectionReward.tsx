import { useMemo } from 'react';
import { Pie, PieConfig } from '@ant-design/plots';

// import { formatNum } from '@/utils/format';
// import { accDiv, accMul } from '@/utils/utils';
// import useChainInfo from '@/hooks/useChainInfo';
// import useRaiseBase from '@/hooks/useRaiseBase';
import { isMountPlan } from '@/helpers/mount';
import useRaiseRate from '@/hooks/useRaiseRate';
import useRaiseRole from '@/hooks/useRaiseRole';
import useDepositInvestor from '@/hooks/useDepositInvestor';

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

const SectionReward: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  // const { perFil, perPledge } = useChainInfo();
  // const { period, target } = useRaiseBase(data);
  const { isInvestor } = useDepositInvestor(data);
  const { isRaiser, isServicer } = useRaiseRole(data);
  const { priorityRate, raiserRate, servicerRate, ffiRate } = useRaiseRate(data);

  // 预估节点激励 = 24小时产出效率 * 封装天数 * 总算力(质押目标 / 当前扇区质押量)
  // const reward = useMemo(() => accMul(perFil, period, accDiv(target, perPledge)), [perFil, period, perPledge, target]);
  const roles = useMemo(() => {
    return [
      { role: isRaiser, color: '#7FC4FD', name: '主办人' },
      { role: isServicer, color: '#9FD3FD', name: '技术服务商' },
      { role: isInvestor, color: '#2699FB', name: '建设者' },
    ].filter((i) => i.role);
  }, [isRaiser, isServicer, isInvestor]);
  const isMount = useMemo(() => isMountPlan(data), [data]);
  const pieData = useMemo(
    () => [
      { name: '建设者权益', value: priorityRate },
      { name: '主办人权益', value: raiserRate },
      { name: '技术运维服务费', value: servicerRate },
      { name: 'FilFi协议费用', value: ffiRate },
    ],
    [priorityRate, raiserRate, servicerRate, ffiRate],
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
            {/* <div className="col-6 col-md-4">
              <div className="reward-item mb-3">
                <span className="reward-dot reward-dot-circle"></span>
                <p className="reward-label">{period}天总激励(估)</p>
                <p className="reward-text">
                  <span className="text-decimal text-uppercase">{formatNum(reward, '0.0a')}</span>
                  <span className="ms-2 text-neutral">FIL</span>
                </p>
              </div>
            </div> */}
            <div className="col-6 col-md-12 col-lg-6 col-xxl-12">
              <div className="reward-item mb-3" style={{ '--dot-color': '#2699FB' } as any}>
                <span className="reward-dot"></span>
                <p className="reward-label">建设者</p>
                <p className="reward-text">
                  <span className="text-decimal">{priorityRate}</span>
                  <span className="ms-2 text-neutral">%</span>
                </p>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-6 col-xxl-4">
              <div className="reward-item mb-3" style={{ '--dot-color': '#7FC4FD' } as any}>
                <span className="reward-dot"></span>
                <p className="reward-label">主办人</p>
                <p className="reward-text">
                  <span className="text-decimal">{raiserRate}</span>
                  <span className="ms-2 text-neutral">%</span>
                </p>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-6 col-xxl-4">
              <div className="reward-item mb-3" style={{ '--dot-color': '#9FD3FD' } as any}>
                <span className="reward-dot"></span>
                <p className="reward-label">技术运维服务费</p>
                <p className="reward-text">
                  <span className="text-decimal">{servicerRate}</span>
                  <span className="ms-2 text-neutral">%</span>
                </p>
              </div>
            </div>
            <div className="col-6 col-md-4 col-lg-6 col-xxl-4">
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
            <div className="col-4 table-cell th">建设者</div>
            <div className="col-8 table-cell">获得算力的{priorityRate}%</div>
          </div>
        </div>
        <div className="col table-row">
          <div className="row g-0">
            <div className="col-4 table-cell th">分配时间</div>
            <div className="col-8 table-cell">实时分账随时提取</div>
          </div>
        </div>
        {isMount ? (
          <div className="col table-row">
            <div className="row g-0">
              <div className="col-4 table-cell th">质押</div>
              <div className="col-8 table-cell">100%建设者持有</div>
            </div>
          </div>
        ) : (
          <div className="col table-row">
            <div className="row g-0">
              <div className="col-4 table-cell th">封装Gas费</div>
              <div className="col-8 table-cell">由主办人承担</div>
            </div>
          </div>
        )}
        <div className="col table-row">
          <div className="row g-0">
            <div className="col-4 table-cell th">我的角色</div>
            <div className="col-8 table-cell">
              {roles.length ? (
                roles.map(({ color, name }, i) => (
                  <>
                    <span className="d-inline-block p-1 rounded-circle" style={{ backgroundColor: color }} />
                    <span className="ms-1">{name}</span>

                    {i < roles.length - 1 && <span className="mx-1">·</span>}
                  </>
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
