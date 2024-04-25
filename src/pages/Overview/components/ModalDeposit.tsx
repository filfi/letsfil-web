import { Form, Input } from 'antd';

import Modal from '@/components/Modal';
import { catchify } from '@/utils/hackify';
import type { ModalProps } from '@/components/Modal';

export type ModalDepositProps = Omit<ModalProps, 'onConfirm'> & {
  amount?: number;
  onConfirm?: () => any;
};

const ModalDeposit: React.FC<ModalDepositProps> = ({ amount, onConfirm, onHidden, onShown, ...props }) => {
  const [form] = Form.useForm();

  const _onHidden = () => {
    form.resetFields();

    onHidden?.();
  };

  const _onShown = () => {
    form.setFieldValue('amount', amount ?? 0);

    onShown?.();
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
    <Modal.Confirm
      title="追加保證金"
      bodyClassName="pb-0"
      footerClassName="border-top"
      {...props}
      onHidden={_onHidden}
      onShown={_onShown}
      onConfirm={handleValidate}
    >
      <div className="ffi-form px-3">
        <Form form={form} size="large" initialValues={{ amount }} onFinish={handleFinish}>
          <div className="ffi-item">
            <h4 className="ffi-label">追加數量</h4>
            <Form.Item name="amount">
              <Input readOnly type="number" placeholder="請輸入追加數量" />
            </Form.Item>
          </div>
        </Form>
      </div>
    </Modal.Confirm>
  );
};

export default ModalDeposit;
