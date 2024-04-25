import { useMemo } from 'react';
import { Form, Input } from 'antd';
import { useUpdateEffect } from 'ahooks';

import * as V from '@/utils/validators';
import SpinBtn from '@/components/SpinBtn';
import { accDiv, accSub } from '@/utils/utils';
import { formatAmount, toFixed } from '@/utils/format';

const Pledge: React.FC<{
  balance?: number;
  disabled?: boolean;
  hidden?: boolean;
  loading?: boolean;
  rate?: number;
  onConfirm?: (amount: string) => Promise<any>;
}> = ({ balance, disabled, hidden, loading, rate, onConfirm }) => {
  const [form] = Form.useForm();
  const amount = Form.useWatch('amount', form);

  const max = useMemo(() => Math.max(Number(toFixed(accSub(balance ?? 0, 0.5), 4)), 0), [balance]);
  const insufficient = useMemo(() => max <= 0, [max]);

  useUpdateEffect(() => {
    let afil = 0;

    if (rate && rate > 0) {
      afil = accDiv(amount, rate);
    }

    form.setFieldValue('afil', Number.isNaN(afil) ? 0 : Number(toFixed(afil, 4)));
  }, [amount, rate]);

  const handleMax = () => {
    if (insufficient || disabled) return;

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
            { required: true, message: '請輸入存入FIL數量' },
            {
              validator: V.Queue.create()
                .add(V.createDecimalValidator(8, '最多支援8位小數'))
                .add(V.createGtValidator(0, '必須大於0'))
                .add(V.createLteValidator(max, `最多可質押 ${formatAmount(max)} FIL`))
                .build(),
            },
          ]}
        >
          <Input
            placeholder="輸入存入FIL數量"
            readOnly={insufficient || disabled}
            prefix={<span className="text-gray">FIL</span>}
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

        {!hidden && (
          <>
            <div className="mb-4">
              <Form.Item name="afil" noStyle>
                <Input
                  readOnly
                  placeholder="計算獲得aFIL數量"
                  prefix={<span className="text-gray">aFIL</span>}
                  suffix={<span className="bi bi-info-circle text-gray"></span>}
                />
              </Form.Item>
            </div>

            <SpinBtn
              className="btn btn-primary btn-lg w-100"
              type="submit"
              loading={loading}
              disabled={insufficient || disabled}
            >
              {insufficient ? '帳戶餘額不足' : '質押'}
            </SpinBtn>
          </>
        )}
      </Form>
    </>
  );
};

export default Pledge;
