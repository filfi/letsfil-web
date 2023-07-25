import { Form, Input } from 'antd';

import Modal from '@/components/Modal';
import { catchify } from '@/utils/hackify';
import type { ModalProps } from '@/components/Modal';

export type ModalDepositProps = Omit<ModalProps, 'onConfirm'> & {
  amount?: number;
  onConfirm?: () => any;
};

const ModalDeposit: React.FC<ModalDepositProps> = ({ amount, onConfirm, onHidden, ...props }) => {
  const [form] = Form.useForm();

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

  const handleFinish = () => {
    onConfirm?.();
  };

  return (
    <Modal.Confirm title="追加保证金" bodyClassName="pb-0" footerClassName="border-top" {...props} onHidden={_onHidden} onConfirm={handleValidate}>
      <div className="ffi-form px-3">
        <Form form={form} size="large" initialValues={{ amount }} onFinish={handleFinish}>
          <div className="ffi-item">
            <h4 className="ffi-label">追加数量</h4>
            <Form.Item name="amount">
              <Input readOnly type="number" placeholder="请输入追加数量" />
            </Form.Item>
          </div>
        </Form>
      </div>
    </Modal.Confirm>
  );
};

export default ModalDeposit;
