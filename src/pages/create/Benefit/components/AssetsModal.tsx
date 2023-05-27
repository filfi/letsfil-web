import { Avatar, Checkbox, Form, Input } from 'antd';
import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';

import Modal from '@/components/Modal';
import { accSub } from '@/utils/utils';
import { catchify } from '@/utils/hackify';
import useProvider from '@/hooks/useProvider';
import { formatEther, formatNum } from '@/utils/format';

export type AssetsModalProps = {
  data?: API.Base | null;
  onConfirm?: () => void;
};

const AssetsModalRender: React.ForwardRefRenderFunction<ModalAttrs, AssetsModalProps> = ({ data, onConfirm }, ref?: React.Ref<ModalAttrs> | null) => {
  const modal = useRef<ModalAttrs>(null);

  const [form] = Form.useForm();
  const { getProvider } = useProvider();
  const powerRate = useMemo(() => data?.raiseHisPowerRate ?? 0, [data?.raiseHisPowerRate]);
  const servicerPowerRate = useMemo(() => Math.max(accSub(100, powerRate), 0), [powerRate]);
  const provider = useMemo(() => getProvider?.(data?.serviceId), [data?.serviceId, getProvider]);

  useImperativeHandle(
    ref,
    () => ({
      hide: () => modal.current?.hide(),
      show: () => modal.current?.show(),
      toggle: () => modal.current?.toggle(),
    }),
    [],
  );

  const handleHiddn = () => {
    form.resetFields();
  };

  const handleConfirm = async () => {
    const [e] = await catchify(() => form.validateFields())();

    if (e) {
      return false;
    }

    onConfirm?.();
  };

  return (
    <>
      <Modal.Confirm
        ref={modal}
        icon="tag"
        title="历史资产归属"
        cancelText="关闭"
        confirmText="继续"
        footerClassName="border-0"
        onHidden={handleHiddn}
        onConfirm={handleConfirm}
      >
        <p className="mb-4 fs-16">
          检测到 {data?.minerId} 是已存在的节点，先确认历史资产的归属。历史资产不属于当前募集计划，移交Owner之后，FilFi智能合约将按约定比例独立分配。
        </p>

        <div className="ffi-form mb-4">
          <div className="row row-cols-2 g-3">
            <div className="col ffi-item">
              <Input
                readOnly
                className="text-end bg-light"
                size="large"
                prefix={
                  <div className="d-flex algin-items-center">
                    <span className="fs-24 lh-1 text-gray-dark">
                      <span className="bi bi-people"></span>
                    </span>
                    <span className="ms-2">灵境资产管理</span>
                  </div>
                }
                suffix="%"
                value={powerRate}
              />
            </div>
            <div className="col ffi-item">
              <Input
                readOnly
                className="text-end bg-light"
                size="large"
                prefix={
                  <div className="d-flex algin-items-center">
                    <Avatar src={provider?.logo_url} size={24} />
                    <span className="ms-2">{provider?.short_name}</span>
                  </div>
                }
                suffix="%"
                value={servicerPowerRate}
              />
            </div>
          </div>
        </div>

        <div className="d-flex justify-content-around gap-3 mb-4">
          {/* <div className="row row-cols-2 row-cols-lg-4 g-3 g-lg-4"> */}
          <div className="d-inline-flex flex-column">
            <p className="mb-0 fw-500">{formatNum(data?.hisPower, '0.0 ib')}</p>
            <p className="mb-0 text-gray-dark">算力(QAP)</p>
          </div>
          <div className="d-inline-flex flex-column">
            <p className="mb-0 fw-500">{formatEther(data?.hisInitialPledge)} FIL</p>
            <p className="mb-0 text-gray-dark">质押币</p>
          </div>
          <div className="d-inline-flex flex-column">
            <p className="mb-0 fw-500">{formatEther(data?.hisBlance)} FIL</p>
            <p className="mb-0 text-gray-dark">余额（含线性释放）</p>
          </div>
          <div className="d-inline-flex flex-column">
            <p className="mb-0 fw-500">{data?.hisSectorCount} 个</p>
            <p className="mb-0 text-gray-dark">扇区数量</p>
          </div>
          {/* </div> */}
        </div>

        <Form form={form}>
          <Form.Item name="agree" valuePropName="checked" rules={[{ required: true, message: '请确认' }]}>
            <Checkbox>
              <span>同意</span>
              <span className="fw-bold">{data?.minerId}</span>
              <span>已存在的</span>
              <span className="fw-bold">算力</span>
              <span>和</span>
              <span className="fw-bold">质押币</span>
              <span>按以上分配比例</span>
            </Checkbox>
          </Form.Item>
        </Form>
      </Modal.Confirm>
    </>
  );
};

export default forwardRef(AssetsModalRender);
