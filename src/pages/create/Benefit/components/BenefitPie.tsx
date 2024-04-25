import { useMemo } from 'react';
import { Pie } from '@ant-design/plots';
import type { PieConfig } from '@ant-design/plots';

const BenefitPie: React.FC<{
  name?: string;
  value?: number;
  height?: number;
}> = ({ name, height = 150, value = 0 }) => {
  const pieData = useMemo(
    () => [
      { name: name ?? '-', value },
      { name: '建設者', value: Math.max(100 - value, 0) },
    ],
    [name, value],
  );

  const config: PieConfig = {
    width: height,
    height: height,
    data: pieData,
    colorField: 'name',
    angleField: 'value',
    radius: 1,
    innerRadius: 0.5,
    label: false,
    color: ['#2699FB', '#BCE0FD'],
    statistic: {
      title: {
        content: '質押',
        style: {
          fontSize: '14px',
          fontWeight: 500,
        },
      },
      content: false,
    },
    legend: {
      layout: 'vertical',
      position: 'right-top',
      offsetX: -30,
    },
    tooltip: {
      formatter(item) {
        return { name: item.name, value: item.value + '%' };
      },
    },
  };

  return (
    <div style={{ height }}>
      <Pie {...config} />
    </div>
  );
};

export default BenefitPie;
