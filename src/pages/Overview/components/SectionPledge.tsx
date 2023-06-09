import { useMemo } from 'react';
import { Pie, PieConfig } from '@ant-design/plots';

import { formatAmount } from '@/utils/format';
import useRaiseBase from '@/hooks/useRaiseBase';
import useRaiseRate from '@/hooks/useRaiseRate';
import useRaiseState from '@/hooks/useRaiseState';
import { accAdd, accDiv, accMul, accSub } from '@/utils/utils';

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

const SectionPledge: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { actual } = useRaiseBase(data);
  const { opsRatio } = useRaiseRate(data);
  const { isSuccess } = useRaiseState(data);

  // 实际保证金配比：运维保证金配比 = 运维保证金 / (运维保证金 + 已质押金额)
  const ops = useMemo(() => accDiv(accMul(actual, accDiv(opsRatio, 100)), accSub(1, accDiv(opsRatio, 100))), [actual, opsRatio]);
  const totalAmount = useMemo(() => accAdd(actual, ops), [actual, ops]);
  const investRate = useMemo(() => Math.max(accSub(100, opsRatio), 0), [opsRatio]);

  const pieData = useMemo(
    () => [
      { name: '优先建设者', value: investRate },
      { name: '运维保证金', value: opsRatio },
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
                <p className="reward-label">优先质押</p>
                <p className="reward-text">
                  <span className="text-decimal">{investRate}</span>
                  <span className="ms-2 text-neutral">%</span>
                </p>
              </div>
            </div>
            <div className="col-6 col-lg-7 col-xxl-6">
              <div className="reward-item mb-3" style={{ '--dot-color': '#7FC4FD' } as any}>
                <span className="reward-dot"></span>
                <p className="reward-label">劣后质押(运维保证金)</p>
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
                  <p className="reward-label">质押总和(优先质押+劣后质押)</p>
                  <p className="reward-text">
                    <span className="text-decimal">{formatAmount(totalAmount, 2, 2)}</span>
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
            <div className="col-4 table-cell th">优先质押</div>
            <div className="col-8 table-cell">优先分配，优先返还</div>
          </div>
        </div>
        <div className="col table-row">
          <div className="row g-0">
            <div className="col-4 table-cell th">劣后质押</div>
            <div className="col-8 table-cell">优先受罚，最后返还</div>
          </div>
        </div>
      </div>
      <div className="table-row w-100">
        <div className="row g-0">
          <div className="col-4 col-md-2 col-lg-4 col-xl-2 table-cell th">保证金比例</div>
          <div className="col-8 col-md-10 col-lg-8 col-xl-10 table-cell">按质押数额等比例配比保证金，始终保持保证金占比{opsRatio}%</div>
        </div>
      </div>
    </>
  );
};

export default SectionPledge;
