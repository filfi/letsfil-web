import { useEffect } from 'react';
import { Form, Input } from 'antd';
import { history, useModel } from '@umijs/max';

import { accAdd } from '@/utils/utils';
import { formatAmount } from '@/utils/format';
import * as validators from '@/utils/validators';

export default function CreateAllocation() {
  const [form] = Form.useForm();
  const [data, setData] = useModel('stepform');
  const amount = Form.useWatch('target', form);

  useEffect(() => {
    let val = amount * 0.05;
    if (Number.isNaN(val)) {
      val = 0;
    }

    form.setFieldValue('earnest', formatAmount(val));
  }, [amount]);

  const handleSubmit = ({ raiserShare, investorShare, servicerShare }: API.Base) => {
    if (accAdd(accAdd(raiserShare, investorShare), servicerShare) !== 100) {
      form.setFields([
        { name: 'raiserShare', errors: ['三方权益总和应为100%'] },
        { name: 'investorShare', errors: ['三方权益总和应为100%'] },
        { name: 'servicerShare', errors: ['三方权益总和应为100%'] },
      ]);

      return;
    }

    setData((d) => ({ ...d, raiserShare, investorShare, servicerShare }));

    history.push('/letsfil/create/build');
  };

  return (
    <>
      <div className="alert alert-primary mb-4" role="alert">
        <i className="bi bi-info-circle"></i>
        <span className="ms-2">三方权益总和应为100%</span>
      </div>

      <Form form={form} layout="vertical" initialValues={data ?? {}} onFinish={handleSubmit}>
        <Form.Item label="募集商权益" name="raiserShare" rules={[{ required: true, message: '请输入募集商权益' }, { validator: validators.percent }]}>
          <Input type="number" max={100} min={0} suffix="%" placeholder="请输入百分比" />
        </Form.Item>

        <Form.Item label="投资者权益" name="investorShare" rules={[{ required: true, message: '请输入投资者权益' }, { validator: validators.percent }]}>
          <Input type="number" max={100} min={0} suffix="%" placeholder="请输入百分比" />
        </Form.Item>

        <Form.Item label="服务商权益" name="servicerShare" rules={[{ required: true, message: '请输入服务商权益' }, { validator: validators.percent }]}>
          <Input type="number" max={100} min={0} suffix="%" placeholder="请输入百分比" />
        </Form.Item>

        <div className="letsfil-item letsfil-actions text-center">
          <button className="btn btn-light" type="button" onClick={history.back}>
            上一步
          </button>
          <button className="btn btn-light ms-4" type="submit">
            下一步
          </button>
        </div>
      </Form>
    </>
  );
}
