import { Form, Input } from 'antd';
import { forwardRef, useImperativeHandle, useRef } from 'react';

import Modal from '@/components/Modal';
import { number } from '@/utils/validators';

const Unstaking: React.ForwardRefRenderFunction<
  ModalAttrs,
  {
    amount?: number | string;
    onConfirm?: (amount: string) => void;
  }
> = ({ amount, onConfirm }, ref?: React.Ref<ModalAttrs> | null) => {
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

  const handleAll = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault();

    form.setFieldValue('amount', amount);
  };

  const handleConfirm = async () => {
    try {
      await form.validateFields();
    } catch (e) {
      return false;
    }

    const amount = form.getFieldValue('amount');

    onConfirm?.(amount);
  };

  return (
    <Modal ref={modal} title="赎回FIL" bodyClassName="pb-0" confirmText="提交" onConfirm={handleConfirm}>
      <p className="text-gray text-center">注：赎回行为会产生Gas费</p>

      <Form layout="vertical" form={form}>
        <Form.Item name="amount" label="赎回数量" rules={[{ required: true, message: '输入数量' }, { validator: number }]}>
          <Input
            suffix="FIL"
            placeholder="0.000000"
            addonAfter={
              <a href="#" onClick={handleAll}>
                赎回全部
              </a>
            }
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default forwardRef(Unstaking);
