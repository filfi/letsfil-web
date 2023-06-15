import dayjs from 'dayjs';
import { find } from 'lodash';
import { useRequest } from 'ahooks';
import { useParams } from '@umijs/max';
import { useMemo, useState } from 'react';
import { Column } from '@ant-design/plots';
import type { ColumnConfig } from '@ant-design/plots';

import { dailyIncome } from '@/apis/packs';
import FormRadio from '@/components/FormRadio';
import { formatAmount, toNumber } from '@/utils/format';

const config: ColumnConfig = {
  data: [],
  height: 200,
  xField: 'date',
  yField: 'value',
  color: '#9FD3FD',
  xAxis: {
    label: {
      formatter(text) {
        return dayjs(text).format('MM-DD');
      },
    },
    tickLine: null,
  },
  yAxis: {
    label: null,
    line: null,
    grid: null,
  },
  tooltip: {
    formatter(data) {
      return {
        name: '节点激励',
        value: `${formatAmount(data.value)} FIL`,
      };
    },
  },
};

const RewardChart: React.FC = () => {
  const param = useParams();
  const [size, setSize] = useState(7);

  const service = async () => {
    if (param.id) {
      return await dailyIncome({ page: 1, page_size: size, asset_pack_id: param.id });
    }
  };

  const { data, loading } = useRequest(service, { refreshDeps: [size, param.id] });

  const dates = useMemo(
    () =>
      Array.from<string>({ length: size }).reduceRight((list, _, idx) => {
        return list.concat(dayjs().subtract(idx, 'day').format('YYYY-MM-DD'));
      }, [] as string[]),
    [size],
  );

  const items = useMemo(
    () =>
      dates.map((date) => {
        const item = find(data, { date });

        return {
          date,
          value: toNumber(item?.release_reward),
        };
      }),
    [data, dates],
  );

  return (
    <div className="mb-3">
      <div className="d-flex gap-3 mb-3">
        <h4 className="my-auto fs-18 fw-600">每日节点激励</h4>

        <FormRadio
          className="btn-group ms-auto"
          value={size}
          type="button"
          items={[
            { label: '7日', value: 7 },
            { label: '14日', value: 14 },
            { label: '30日', value: 30 },
          ]}
          onChange={setSize}
        />
      </div>

      <div className="position-relative w-100" style={{ height: 200 }}>
        <Column {...config} loading={loading} data={items} />
      </div>
    </div>
  );
};

export default RewardChart;
