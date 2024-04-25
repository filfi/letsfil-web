import { Form, Input } from 'antd';
import { useModel } from '@umijs/max';
import { useEffect, useMemo } from 'react';

import Dialog from '@/components/Dialog';
import SpinBtn from '@/components/SpinBtn';
import useAccount from '@/hooks/useAccount';
import { integer } from '@/utils/validators';
import { formatAmount } from '@/utils/format';
import { parseWhitelist } from '@/helpers/app';
import useLoanAsset from '@/hooks/useLoanAsset';
import { isBlock, isTargeted } from '@/helpers/raise';
import { accSub, isEqual, sleep } from '@/utils/utils';

const limit = 5_000_000;

const CardStaking: React.FC = () => {
  const [form] = Form.useForm();
  const { address } = useAccount();
  const { assets, base, plan, state } = useModel('Overview.overview');
  const { actual, target } = base;
  const { investorAction } = assets;
  const { total } = useLoanAsset(plan?.raising_id);
  const { isDelayed, isRaising, isSuccess, isSealing } = state;

  const max = useMemo(() => Math.min(Math.max(accSub(target, actual), 0), limit), [actual, target]);
  const whitelist = useMemo(() => plan && parseWhitelist(plan?.raise_white_list), [plan?.raise_white_list]);
  const investor = useMemo(() => whitelist?.find((i) => isEqual(i.address, address)), [address, whitelist]);

  const isBlocked = useMemo(() => plan && isBlock(plan), [plan]);
  const whiteItem = useMemo(() => whitelist?.find((i) => isEqual(i.address, address)), [address]);
  const isReadonly = useMemo(() => !!(isBlocked && whiteItem && whiteItem.limit), [isBlocked, whiteItem]);

  const amountValidator = async (rule: unknown, value: string) => {
    await integer(rule, value);

    if (value) {
      if (+value <= 0) {
        return Promise.reject(`必須大於 0`);
      }

      if (max && +value > max) {
        return Promise.reject(`不能大於 ${formatAmount(max)} FIL`);
      }
    }
  };

  const validateAmount = (amount: string) => {
    const val = Number(amount);

    if (Number.isNaN(val) || !investor) return false;

    const limit = Number(investor.limit);

    if (limit > 0 && val > limit) {
      Dialog.error({
        title: '質押超過限額',
        content: `目前登入錢包地址最高可質押 ${formatAmount(limit)} FIL`,
        confirmText: '知道了',
      });

      return false;
    }

    return true;
  };

  const handleStake = async ({ amount }: { amount: string }) => {
    if (isTargeted(plan) && !validateAmount(amount)) return;

    await investorAction.stakeAction(amount);

    await sleep(1_000);

    investorAction.refetch();

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
        <div className="card section-card sticky-card">
          <div className="card-header d-flex flex-wrap align-items-center">
            <h4 className="card-title mb-0 me-auto pe-2">我的質押</h4>
            <p className="mb-0">
              <span className="fs-5 fw-600">{formatAmount(total)}</span>
              <span className="text-neutral ms-1">FIL</span>
            </p>
          </div>
          <div className="card-body">
            {isTargeted(plan) && !investor ? (
              <>
                <p className="mb-3">
                  <SpinBtn className="btn btn-light btn-lg w-100" disabled>
                    質押
                  </SpinBtn>
                </p>

                <p className="mb-0 text-gray">
                  這是一個 “定向計劃”，您目前登入的錢包地址不能參與，請更換登入錢包，或諮詢計劃的主辦人。
                </p>
              </>
            ) : isSuccess && (isDelayed || isSealing) ? (
              <SpinBtn className="btn btn-light btn-lg w-100" disabled>
                {isDelayed || isSealing ? '正在封裝' : '準備封裝'}
              </SpinBtn>
            ) : (
              <Form className="ffi-form" form={form} onFinish={handleStake}>
                <Form.Item
                  name="amount"
                  rules={[{ required: true, message: '請輸入數量' }, { validator: amountValidator }]}
                >
                  <Input
                    type="number"
                    className="decimal lh-1 fw-500"
                    min={0}
                    step={0.01}
                    placeholder="輸入數量"
                    readOnly={isReadonly}
                    max={isReadonly ? undefined : max}
                    suffix={<span className="fs-6 fw-normal text-gray-dark align-self-end">FIL</span>}
                  />
                </Form.Item>

                <p className="mb-0">
                  <SpinBtn type="submit" className="btn btn-primary btn-lg w-100" loading={investorAction.staking}>
                    質押
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
