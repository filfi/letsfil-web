import { useState } from 'react';

import FormRadio from '@/components/FormRadio';

const RewardChart: React.FC<{ id?: string }> = ({}) => {
  const [size, setSize] = useState(7);

  return (
    <div>
      <div className="d-flex gap-3 mb-3">
        <h4 className="my-auto fs-18 fw-600">每日收益</h4>

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

      <div></div>
    </div>
  );
};

export default RewardChart;
