import { history } from '@umijs/max';
import { Form, Input, Select } from 'antd';

import styles from './styles.less';
import Steps from '@/components/Steps';
import Breadcrumb from '@/components/Breadcrumb';
import PageHeader from '@/components/PageHeader';

export default function Build() {
  const [form] = Form.useForm();

  const handleSubmit = () => {
    history.push('/market/confirm');
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
          <Steps current={2} />
        </div>
        <div className={styles.form}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="Miner ID"
              name="minerId"
              rules={[
                { required: true, message: '请输入Miner ID' },
              ]}
            >
              <Input placeholder="如：F053746" />
            </Form.Item>

            <Form.Item
              label="封装节点大小"
              name="size"
              help="单位进制按1024算"
              rules={[
                { required: true, message: '请输入封装节点大小' },
              ]}
            >
              <Input addonAfter="PB" placeholder="请输入数目" />
            </Form.Item>

            <Form.Item
              label="单个扇区大小"
              name="sector"
              rules={[
                { required: true, message: '请选择单个扇区大小' },
              ]}
            >
              <Select
                placeholder="请选择"
                options={[
                  { value: 0, label: '32GB' },
                  { value: 1, label: '64GB' },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="节点运行周期"
              name="period"
              rules={[
                { required: true, message: '请选择节点运行周期' },
              ]}
            >
              <Select
                placeholder="请选择"
                options={[
                  { value: 0, label: '90天' },
                  { value: 1, label: '180天' },
                  { value: 2, label: '360天' },
                ]}
              />
            </Form.Item>

            <Form.Item
              label="封装期限"
              name="time"
              help="募集成功后需在该期限内封装完毕并投入生产，否则会产生罚金"
              rules={[
                { required: true, message: '请输入天数，不大于30' },
              ]}
            >
              <Input addonAfter="天" placeholder="请输入天数，不大于30" />
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
