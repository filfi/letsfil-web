import { ethers } from 'ethers';
import { useMemo } from 'react';
import { Form, Input } from 'antd';

import { accSub } from '@/utils/utils';
import SpinBtn from '@/components/SpinBtn';
import { number } from '@/utils/validators';
import { formatAmount } from '@/utils/format';
import useRaiseInfo from '@/hooks/useRaiseInfo';
import useProcessify from '@/hooks/useProcessify';
import useRaiseState from '@/hooks/useRaiseState';
import useRaiseContract from '@/hooks/useRaiseContract';
import useDepositInvestor from '@/hooks/useDepositInvestor';
import type { ItemProps } from './types';

const CardStaking: React.FC<ItemProps> = ({ data }) => {
  const [form] = Form.useForm();
  const { staking } = useRaiseContract(data?.raise_address);
  const { amount } = useDepositInvestor(data);
  const { actual, target } = useRaiseInfo(data);
  const { isRaising, isSealing } = useRaiseState(data);

  const max = useMemo(() => Math.max(accSub(target, actual), 0), [actual, target]);

  const amountValidator = async (rule: unknown, value: string) => {
    await number(rule, value);

    if (value) {
      if (max && +value > max) {
        return Promise.reject(`不能大于 ${formatAmount(max)} FIL`);
      }

      if (+value > 5000000) {
        return Promise.reject('不能大于 5,000,000 FIL');
      }
    }
  };

  const [loading, handleStaking] = useProcessify(async ({ amount }: { amount: string }) => {
    if (!data) return;

    await staking(data.raising_id, {
      value: ethers.utils.parseEther(`${amount}`),
    });

    form.resetFields();
  });

  if (isRaising || isSealing) {
    return (
      <>
        <div className="card section-card">
          <div className="card-header d-flex flex-wrap align-items-center">
            <h4 className="card-title mb-0 me-auto pe-2">我的资产</h4>
            <p className="mb-0">
              <span className="fs-5 fw-600">{formatAmount(amount)}</span>
              <span className="text-neutral ms-1">FIL</span>
            </p>
          </div>
          <div className="card-body">
            {isSealing ? (
              <SpinBtn className="btn btn-light btn-lg w-100" disabled>
                {isSealing ? '正在封装' : '等待封装'}
              </SpinBtn>
            ) : (
              <Form className="ffi-form" form={form} onFinish={handleStaking}>
                <Form.Item name="amount" rules={[{ required: true, message: '请输入数量' }, { validator: amountValidator }]}>
                  <Input
                    type="number"
                    className="decimal lh-1 fw-500"
                    min={0}
                    max={max}
                    placeholder="输入数量"
                    suffix={<span className="fs-6 fw-normal text-gray-dark align-self-end">FIL</span>}
                  />
                </Form.Item>

                <p className="mb-0">
                  <SpinBtn type="submit" className="btn btn-primary btn-lg w-100" loading={loading}>
                    存入
                  </SpinBtn>
                </p>
              </Form>
            )}
          </div>
        </div>
      </>
    );
  }

  return null;
};

export default CardStaking;
