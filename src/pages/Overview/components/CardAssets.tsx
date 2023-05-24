import { ethers } from 'ethers';
import { Form, Input } from 'antd';

import SpinBtn from '@/components/SpinBtn';
import { number } from '@/utils/validators';
import { formatAmount } from '@/utils/format';
import useProcessify from '@/hooks/useProcessify';
import useRaiseState from '@/hooks/useRaiseState';
import useDepositInvest from '@/hooks/useDepositInvest';

const CardAssets: React.FC<{ data?: API.Plan }> = ({ data }) => {
  const [form] = Form.useForm();
  const { amount } = useDepositInvest(data);
  const { contract, isClosed, isFailed, isFinished, isRaising, isSealing, isSuccess } = useRaiseState(data);

  const [loading, handleStaking] = useProcessify(async ({ amount }: { amount: string }) => {
    if (!data) return;

    await contract.staking(data.raising_id, {
      value: ethers.utils.parseEther(`${amount}`),
    });

    form.resetFields();
  });

  if (isClosed || isFailed) {
    return (
      <div className="card section-card">
        <div className="card-body">
          <div className="d-flex flex-wrap align-items-center mb-2">
            <h5 className="card-title mb-0 me-auto pe-2">我的资产</h5>
            <p className="mb-0 text-main">
              <span className="fs-5 fw-600">{formatAmount(amount)}</span>
              <span className="text-neutral ms-1">FIL</span>
            </p>
          </div>
          <div className="d-flex flex-wrap align-items-center">
            <div className="card-title mb-0 d-inline-flex align-items-center me-auto pe-2">
              <h5 className="card-title mb-0">利息补偿</h5>
              <span className="mx-1">·</span>
              <a className="text-underline" href="#">
                明细
              </a>
            </div>
            <p className="mb-0 text-success">
              <span className="fs-5 fw-600">+0</span>
              <span className="text-neutral ms-1">FIL</span>
            </p>
          </div>
        </div>
        {/* <div className="card-footer">
          <SpinBtn className="btn btn-primary btn-lg w-100">取回</SpinBtn>
        </div> */}
      </div>
    );
  }

  if (isFinished) {
    return (
      <div className="card section-card">
        <div className="card-body">
          <h4 className="card-title fw-600 mb-3">我的资产</h4>

          <div className="d-flex flex-wrap align-items-center mb-2">
            <h5 className="card-title mb-0 me-auto pe-2">投资金额</h5>
            <p className="mb-0 text-main">
              <span className="fs-5 fw-600">{formatAmount(amount)}</span>
              <span className="text-neutral ms-1">FIL</span>
            </p>
          </div>

          <div className="d-flex flex-wrap align-items-center mb-2">
            <h5 className="card-title mb-0 me-auto pe-2">获得存储算力</h5>
            <p className="mb-0 text-main">
              <span className="fs-5 fw-600">0</span>
              <span className="text-neutral ms-1">TiB</span>
            </p>
          </div>

          <div className="d-flex flex-wrap align-items-center">
            <h5 className="card-title mb-0 me-auto pe-2">在 {data?.miner_id} 中的占比</h5>
            <p className="mb-0 text-main">
              <span className="fs-5 fw-600">0</span>
              <span className="text-neutral ms-1">%</span>
            </p>
          </div>
        </div>
        <div className="card-footer">
          <SpinBtn className="btn btn-primary btn-lg w-100">在{data?.miner_id}上查看</SpinBtn>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="card section-card">
        <div className="card-body">
          <div className="d-flex flex-wrap align-items-center">
            <h4 className="card-title mb-0 me-auto pe-2">我的资产</h4>
            <p className="mb-0">
              <span className="fs-5 fw-600">{formatAmount(amount)}</span>
              <span className="text-neutral ms-1">FIL</span>
            </p>
          </div>
        </div>
        <div className="card-footer">
          <SpinBtn className="btn btn-light btn-lg w-100" disabled>
            {isSealing ? '正在封装' : '等待封装'}
          </SpinBtn>
        </div>
      </div>
    );
  }

  if (isRaising) {
    return (
      <div className="card section-card">
        <div className="card-header d-flex flex-wrap align-items-center">
          <h4 className="card-title mb-0 me-auto pe-2">我的资产</h4>
          <p className="mb-0">
            <span className="fs-5 fw-600">{formatAmount(amount)}</span>
            <span className="text-neutral ms-1">FIL</span>
          </p>
        </div>
        <div className="card-body">
          <Form className="ffi-form" form={form} onFinish={handleStaking}>
            <Form.Item name="amount" rules={[{ required: true, message: '请输入数量' }, { validator: number }]}>
              <Input
                type="number"
                className="decimal lh-1 fw-500"
                min={0}
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
        </div>
      </div>
    );
  }

  return null;
};

export default CardAssets;
