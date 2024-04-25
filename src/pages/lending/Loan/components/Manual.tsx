import { Form, FormInstance, Input } from 'antd';

import * as V from '@/utils/validators';
import { formatAmount } from '@/utils/format';

export type ManualProps = {
  form?: FormInstance;
  max?: number;
  name: string;
};

const InputWithHelp: React.FC<React.ComponentProps<typeof Input> & { extra?: React.ReactNode }> = ({
  extra,
  ...props
}) => {
  return (
    <>
      <Input {...props} />

      {extra}
    </>
  );
};

const Manual: React.FC<ManualProps> = ({ form, name, max = 0 }) => {
  const handleAll = () => {
    form?.setFieldValue(name, max);
    form?.validateFields([name]);
  };

  return (
    <>
      <Form.Item
        name={name}
        rules={[
          { required: true, message: '請輸入金額' },
          {
            validator: V.Queue.create()
              .add(V.createDecimalValidator(8, '最多支援8位小數'))
              .add(V.createGtValidator(0, '必須大於0'))
              .add(V.createLteValidator(max, `最多可藉 ${formatAmount(max)} FIL`))
              .build(),
          },
        ]}
      >
        <InputWithHelp
          type="number"
          placeholder="輸入金額"
          extra={
            <p className="d-flex justify-content-between gap-4 mt-1 mb-0">
              <span className="text-gray">還可藉 {formatAmount(max)} FIL</span>
              <button type="button" className="btn btn-link p-0" onClick={handleAll}>
                全部填入
              </button>
            </p>
          }
        />
      </Form.Item>
    </>
  );
};

export default Manual;
