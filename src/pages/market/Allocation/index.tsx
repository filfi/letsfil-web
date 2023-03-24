import { useEffect } from 'react';
import { Form, Input } from 'antd';
import { history } from '@umijs/max';

import styles from './styles.less';
import Steps from '@/components/Steps';
import { formatAmount } from '@/utils/format';
import Breadcrumb from '@/components/Breadcrumb';
import PageHeader from '@/components/PageHeader';

export default function Allocation() {
  const [form] = Form.useForm();

  const amount = Form.useWatch('target', form);

  useEffect(() => {
    let val = amount * 0.05;
    if (Number.isNaN(val)) {
      val = 0;
    }

    form.setFieldValue('earnest', formatAmount(val));
  }, [amount]);

  const handleSubmit = () => {
    history.push('/market/build');
  };

  return (
    <div className="container">
      <Breadcrumb items={[
        { title: '我的募集计划', route: '/market/raising' },
        { title: '新建募集计划' },
      ]} />

      <PageHeader
        title="新建募集计划"
      >
        <button className="btn btn-light" type="button">
          <i className="bi bi-x-circle"></i>
          <span className="ms-1">退出</span>
        </button>
      </PageHeader>

      <div className="position-relative">
        <div className="position-absolute">
          <Steps current={1} />
        </div>
        <div className={styles.form}>
          <div className="alert alert-primary mb-4" role="alert">
            <i className="bi bi-info-circle"></i>
            <span className="ms-2">三方权益总和应为100%</span>
          </div>

          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="募集商权益"
              name="raise"
              rules={[
                { required: true, message: '请输入募集商权益' },
              ]}
            >
              <Input addonAfter="%" placeholder="请输入百分比" />
            </Form.Item>

            <Form.Item
              label="投资者权益"
              name="invest"
              rules={[
                { required: true, message: '请输入投资者权益' },
              ]}
            >
              <Input addonAfter="%" placeholder="请输入百分比" />
            </Form.Item>

            <Form.Item
              label="服务商权益"
              name="provider"
              rules={[
                { required: true, message: '请输入服务商权益' },
              ]}
            >
              <Input addonAfter="%" placeholder="请输入百分比" />
            </Form.Item>

            <div className="text-center my-4">
              <button className="btn btn-light" type="submit" style={{ minWidth: 160 }}>下一步</button>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
}
