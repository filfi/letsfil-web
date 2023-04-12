import { Form, Input } from 'antd';
import { forwardRef, useImperativeHandle, useRef } from 'react';

import Modal from '@/components/Modal';

const PayforModal: React.ForwardRefRenderFunction<
  ModalAttrs,
  {
    loading?: boolean;
    onConfirm?: (address: string) => any;
  }
> = ({ loading, onConfirm }, ref?: React.Ref<ModalAttrs> | null) => {
  const modal = useRef<ModalAttrs>(null);

  const [form] = Form.useForm();

  useImperativeHandle(
    ref,
    () => ({
      hide: () => modal.current?.hide(),
      show: () => modal.current?.show(),
      toggle: () => modal.current?.toggle(),
    }),
    [],
  );

  const handleConfirm = async () => {
    try {
      await form.validateFields();
    } catch (e) {
      return false;
    }

    const address = form.getFieldValue('address');

    await onConfirm?.(address);
  };

  return (
    <Modal ref={modal} title="填写支付地址" bodyClassName="pb-0" confirmLoading={loading} onConfirm={handleConfirm}>
      <p className="text-gray text-center">只有该地址对应的账户才能支付运维保证金</p>

      <Form layout="vertical" form={form}>
        <Form.Item name="address" label="钱包地址" rules={[{ required: true, message: '输入地址' }]}>
          <Input placeholder="输入地址" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default forwardRef(PayforModal);
