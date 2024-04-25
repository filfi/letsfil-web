import { Form } from 'antd';

import styles from '../styles.less';
import FFISlider from '@/components/FFISlider';
import { formatAmount } from '@/utils/format';

export type SliderProps = {
  name: string;
  debt?: number | string;
  max?: number | string;
  rate?: number | string;
  percent?: number | string;
};

const Slider: React.FC<SliderProps> = ({ name, debt = 0, max = 0, rate = 0, percent = 0 }) => {
  return (
    <>
      <div className="d-flex justify-content-between mb-2 text-gray">
        <div>
          <p className="mb-1 fs-sm">目前借款</p>
          <p className="mb-1 fw-500">{formatAmount(debt, 4, 2)} FIL</p>
        </div>
        <div className="text-end">
          <p className="mb-1 fs-sm">借款上限</p>
          <p className="mb-1 fw-500">{formatAmount(max)} FIL</p>
        </div>
      </div>
      <Form.Item name={name} rules={[{ required: true, message: '請設定' }]}>
        <FFISlider
          className={styles.slider}
          marks={{
            [rate]: `${rate}%`,
          }}
          railStyle={{ '--current-value': `${percent}%` } as any}
        />
      </Form.Item>
    </>
  );
};

export default Slider;
