import { Form, Input } from 'antd';
import { useEffect, useMemo } from 'react';

import { isBlock } from '@/helpers/raise';
import SpinBtn from '@/components/SpinBtn';
import useAccount from '@/hooks/useAccount';
import { integer } from '@/utils/validators';
import { formatAmount } from '@/utils/format';
import { whitelist } from '@/constants/config';
import useRaiseBase from '@/hooks/useRaiseBase';
import useRaiseState from '@/hooks/useRaiseState';
import { accSub, isEqual, sleep } from '@/utils/utils';
import useDepositInvestor from '@/hooks/useDepositInvestor';

const limit = 5_000_000;

const CardStaking: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const [form] = Form.useForm();
  const { address } = useAccount();
  const { actual, target } = useRaiseBase(data);
  const { isDelayed, isRaising, isSuccess, isSealing } = useRaiseState(data);
  const { amount, staking, stakeAction, refetch } = useDepositInvestor(data);

  const max = useMemo(() => Math.min(Math.max(accSub(target, actual), 0), limit), [actual, target]);

  const isBlocked = useMemo(() => data && isBlock(data), [data]);
  const whiteItem = useMemo(() => whitelist.find((i) => isEqual(i.address, address)), [address]);
  const isReadonly = useMemo(() => !!(isBlocked && whiteItem && whiteItem.limit), [isBlocked, whiteItem]);

  const amountValidator = async (rule: unknown, value: string) => {
    await integer(rule, value);

    if (value) {
      if (+value <= 0) {
        return Promise.reject(`必须大于 0`);
      }

      if (max && +value > max) {
        return Promise.reject(`不能大于 ${formatAmount(max)} FIL`);
      }
    }
  };

  const handleStake = async ({ amount }: { amount: string }) => {
    await stakeAction(amount);

    await sleep(1_000);

    refetch();

    form.resetFields();
  };

  useEffect(() => {
    if (isBlocked && whiteItem && whiteItem.limit) {
      form.setFieldValue('amount', whiteItem.limit);
    }
  }, [isBlocked, whiteItem]);

  if (isBlocked && !whiteItem) return null;

  if (isRaising || isSealing || isDelayed) {
    return (
      <>
        <div className="card section-card">
          <div className="card-header d-flex flex-wrap align-items-center">
            <h4 className="card-title mb-0 me-auto pe-2">我的质押</h4>
            <p className="mb-0">
              <span className="fs-5 fw-600">{formatAmount(amount)}</span>
              <span className="text-neutral ms-1">FIL</span>
            </p>
          </div>
          <div className="card-body">
            {isSuccess && (isDelayed || isSealing) ? (
              <SpinBtn className="btn btn-light btn-lg w-100" disabled>
                {isDelayed || isSealing ? '正在封装' : '准备封装'}
              </SpinBtn>
            ) : (
              <Form className="ffi-form" form={form} onFinish={handleStake}>
                <Form.Item name="amount" rules={[{ required: true, message: '请输入数量' }, { validator: amountValidator }]}>
                  <Input
                    type="number"
                    className="decimal lh-1 fw-500"
                    min={0}
                    step={0.01}
                    placeholder="输入数量"
                    readOnly={isReadonly}
                    max={isReadonly ? undefined : max}
                    suffix={<span className="fs-6 fw-normal text-gray-dark align-self-end">FIL</span>}
                  />
                </Form.Item>

                <p className="mb-0">
                  <SpinBtn type="submit" className="btn btn-primary btn-lg w-100" loading={staking}>
                    质押
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
