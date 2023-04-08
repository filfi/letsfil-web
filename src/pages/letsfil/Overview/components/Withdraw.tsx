import { Form, Input } from 'antd';
import { forwardRef, useImperativeHandle, useRef } from 'react';

import Modal from '@/components/Modal';

const Withdraw: React.ForwardRefRenderFunction<
  ModalAttrs,
  {
    onConfirm?: (address: string) => void;
  }
> = ({ onConfirm }, ref?: React.Ref<ModalAttrs> | null) => {
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

    onConfirm?.(address);
  };

  return (
    <Modal ref={modal} title="提取募集保证金" bodyClassName="pb-0" confirmText="提交" onConfirm={handleConfirm}>
      <p className="text-gray text-center">注：提取行为将产生Gas费</p>

      <Form layout="vertical" form={form}>
        <Form.Item name="address" label="钱包地址" rules={[{ required: true, message: '输入地址' }]}>
          <Input placeholder="输入地址" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default forwardRef(Withdraw);
