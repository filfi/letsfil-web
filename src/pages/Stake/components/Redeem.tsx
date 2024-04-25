import { useMemo } from 'react';
import { Form, Input } from 'antd';
import { useUpdateEffect } from 'ahooks';

import { accMul } from '@/utils/utils';
import * as V from '@/utils/validators';
import SpinBtn from '@/components/SpinBtn';
import { formatAmount, toFixed } from '@/utils/format';

const Redeem: React.FC<{
  balance?: number;
  disabled?: boolean;
  loading?: boolean;
  rate?: number;
  onConfirm?: (amount: string) => Promise<any>;
}> = ({ balance, disabled, loading, rate, onConfirm }) => {
  const [form] = Form.useForm();
  const amount = Form.useWatch('amount', form);

  const max = useMemo(() => Number(toFixed(balance, 4)), [balance]);
  const insufficient = useMemo(() => max <= 0, [max]);

  useUpdateEffect(() => {
    const fil = accMul(amount, rate ?? 0);

    form.setFieldValue('fil', Number.isNaN(fil) ? 0 : Number(toFixed(fil, 4)));
  }, [amount, rate]);

  const handleMax = () => {
    form.setFieldValue('amount', max);
    form.validateFields(['amount']);
  };

  const handleSubmit = async ({ amount }: API.Base) => {
    await onConfirm?.(amount);

    form.resetFields();
  };
  return (
    <>
      <Form className="ffi-form" form={form} size="large" onFinish={handleSubmit}>
        <Form.Item
          name="amount"
          rules={[
            { required: true, message: '請輸入取回aFIL數量' },
            {
              validator: V.Queue.create()
                .add(V.createDecimalValidator(8, '最多支援8位小數'))
                .add(V.createGtValidator(0, '必須大於0'))
                .add(V.createLteValidator(max, `最多可取回 ${formatAmount(max)} aFIL`))
                .build(),
            },
          ]}
        >
          <Input
            placeholder="輸入取回aFIL數量"
            readOnly={insufficient || disabled}
            prefix={<span className="text-gray">aFIL</span>}
            suffix={
              <button
                type="button"
                className="btn btn-link p-0"
                disabled={insufficient || disabled}
                onClick={handleMax}
              >
                MAX
              </button>
            }
          />
        </Form.Item>

        <div className="mb-4">
          <Form.Item name="fil" noStyle>
            <Input
              readOnly
              placeholder="計算獲得FIL數量"
              prefix={<span className="text-gray">FIL</span>}
              suffix={<span className="bi bi-info-circle text-gray"></span>}
            />
          </Form.Item>
        </div>

        <SpinBtn
          className="btn btn-success btn-lg w-100"
          type="submit"
          loading={loading}
          disabled={insufficient || disabled}
        >
          {insufficient ? '暫無可取回的aFIL' : '取回'}
        </SpinBtn>
      </Form>
    </>
  );
};

export default Redeem;
