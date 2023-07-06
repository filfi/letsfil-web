import { Form, Input } from 'antd';

import Modal from '@/components/Modal';
import { catchify } from '@/utils/hackify';
import { integer } from '@/utils/validators';
import type { ModalProps } from '@/components/Modal';

export type ModalDepositProps = Omit<ModalProps, 'onConfirm'> & {
  onConfirm?: (value: string) => any;
};

const ModalDeposit: React.FC<ModalDepositProps> = ({ onConfirm, onHidden, ...props }) => {
  const [form] = Form.useForm();

  const amountValidator = async (rule: unknown, value: string) => {
    await integer(rule, value);

    if (value && +value < 1) {
      return Promise.reject('必须大于 1 FIL');
    }
  };

  const _onHidden = () => {
    form.resetFields();

    onHidden?.();
  };

  const handleValidate = async () => {
    const [e] = await catchify(form.validateFields)();

    if (e) {
      return false;
    }

    form.submit();
  };

  const handleFinish = ({ amount }: { amount: string }) => {
    onConfirm?.(amount);
  };

  return (
    <Modal.Confirm title="追加保证金" bodyClassName="pb-0" footerClassName="border-top" {...props} onHidden={_onHidden} onConfirm={handleValidate}>
      <div className="ffi-form px-3">
        <Form form={form} size="large" onFinish={handleFinish}>
          <div className="ffi-item">
            <h4 className="ffi-label">追加数量</h4>
            <Form.Item name="amount" rules={[{ required: true, message: '请输入数量' }, { validator: amountValidator }]}>
              <Input type="number" min={1} placeholder="请输入追加数量" />
            </Form.Item>
          </div>
        </Form>
      </div>
    </Modal.Confirm>
  );
};

export default ModalDeposit;
