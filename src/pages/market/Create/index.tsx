import { useEffect } from 'react';
import { history } from '@umijs/max';
import { DatePicker, Form, Input } from 'antd';

import styles from './styles.less';
import Steps from '@/components/Steps';
import useWallet from '@/hooks/useWallet';
import { formatAmount } from '@/utils/format';
import Breadcrumb from '@/components/Breadcrumb';
import PageHeader from '@/components/PageHeader';
import ProviderSelect from '@/components/ProviderSelect';

export default function Create() {
  const [form] = Form.useForm();

  const amount = Form.useWatch('target', form);

  const { wallet } = useWallet();

  useEffect(() => {
    let val = amount * 0.05;
    if (Number.isNaN(val)) {
      val = 0;
    }

    form.setFieldValue('earnest', formatAmount(val));
  }, [amount]);

  const handleSubmit = () => {
    history.push('/market/allocation');
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
          <Steps current={0} />
        </div>
        <div className={styles.form}>
          <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
              label="发起账户"
              name="account"
              initialValue={wallet?.address}
            >
              <Input readOnly placeholder="请输入发起账户" />
            </Form.Item>

            <Form.Item
              label="发起单位"
              name="company"
              requiredMark={false}
              rules={[
                { required: true, message: '请输入发起单位' },
              ]}
            >
              <Input placeholder="如：XX科技有限公司" />
            </Form.Item>

            <Form.Item
              label="募集目标"
              name="target"
              requiredMark={false}
              rules={[
                { required: true, message: '请输入募集目标' },
              ]}
            >
              <Input addonAfter="FIL" placeholder="请输入数目" />
            </Form.Item>

            <Form.Item
              label="募集保证金"
              name="earnest"
              help="募集保证金为募集目标的5%，从当前登录钱包地址中进行扣除，节点开始封装时返还"
            >
              <Input readOnly addonAfter="FIL" placeholder="0" />
            </Form.Item>

            <Form.Item
              label="募集截止时间"
              name="endTime"
              help="若未达到募集目标，截止时间后将返还用户质押"
              requiredMark={false}
              rules={[
                { required: true, message: '请选择募集截止时间' },
              ]}
            >
              <DatePicker className="w-100" placeholder="YY-MM-DD 24:00" />
            </Form.Item>

            <Form.Item
              label="选择服务商"
              name="provider"
              requiredMark={false}
              // rules={[
              //   { required: true, message: '请选择服务商' },
              // ]}
            >
              <ProviderSelect />
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
