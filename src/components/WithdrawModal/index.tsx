import { Form, Input } from 'antd';
import { forwardRef, useImperativeHandle, useRef } from 'react';

import Modal from '@/components/Modal';
import { address } from '@/utils/validators';

const WithdrawModal: React.ForwardRefRenderFunction<
  ModalAttrs,
  {
    title?: React.ReactNode;
    content?: React.ReactNode;
    onConfirm?: (address: string) => void;
  }
> = ({ title, content, onConfirm }, ref?: React.Ref<ModalAttrs> | null) => {
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
    <Modal ref={modal} title={title} confirmText="提交" bodyClassName="pb-0" onConfirm={handleConfirm}>
      <p className="text-gray text-center">{content ?? '注：提取行为将产生Gas费'}</p>

      <Form layout="vertical" form={form}>
        <Form.Item name="address" label="钱包地址" rules={[{ required: true, message: '输入地址' }, { validator: address }]}>
          <Input placeholder="输入地址" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default forwardRef(WithdrawModal);
