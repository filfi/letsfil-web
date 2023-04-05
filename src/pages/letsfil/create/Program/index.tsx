import { useEffect } from 'react';
import { useMount } from 'ahooks';
import { Form, Input } from 'antd';
import { history } from '@umijs/max';

import useWallet from '@/hooks/useWallet';
import useStepsForm from '@/hooks/useStepsForm';
import * as validators from '@/utils/validators';
import { accMul, disabledDate } from '@/utils/utils';
import DateTimePicker from '@/components/DateTimePicker';
import ProviderSelect from '@/components/ProviderSelect';

export default function CreateProgram() {
  const [form] = Form.useForm();
  const [data, setData] = useStepsForm();
  const amount = Form.useWatch('targetAmount', form);
  const rate = Form.useWatch('securityFundRate', form);

  const { wallet } = useWallet();

  useEffect(() => {
    let val = 0;

    if (amount && rate) {
      console.log(amount, rate);
      val = accMul(amount, `${rate}`);
    }

    form.setFieldValue('securityFund', Number.isNaN(val) ? 0 : val);
  }, [amount, rate]);

  useEffect(() => {
    if (wallet?.address) {
      form.setFieldValue('sponsor', wallet.address);
    }
  }, [wallet?.address]);

  useMount(() => {
    form.setFieldValue('securityFundRate', 0.05);
  });

  const handleSelect = (_: unknown, item: API.Base) => {
    form.setFieldValue('spAddress', item.wallet_address);
  };

  const handleSubmit = (vals: API.Base) => {
    setData((d) => ({ ...d, ...vals }));

    history.push('/letsfil/create/allocation');
  };

  return (
    <>
      <Form
        form={form}
        layout="vertical"
        initialValues={data ?? {}}
        onFinish={handleSubmit}
      >
        <Form.Item label="发起账户" name="sponsor">
          <Input readOnly placeholder="请输入发起账户" />
        </Form.Item>

        <Form.Item
          label="发起单位"
          name="raiseCompany"
          requiredMark={false}
          rules={[{ required: true, message: '请输入发起单位' }]}
        >
          <Input placeholder="如：XX科技有限公司" />
        </Form.Item>

        <Form.Item
          label="封装节点大小"
          name="nodeSize"
          help="单位进制按1024算"
          rules={[{ required: true, message: '请输入封装节点大小' }]}
        >
          <Input suffix="PB" placeholder="请输入数目" />
        </Form.Item>

        <Form.Item
          label="募集目标"
          name="targetAmount"
          requiredMark={false}
          rules={[
            { required: true, message: '请输入募集目标' },
            { validator: validators.number },
          ]}
        >
          <Input suffix="FIL" placeholder="请输入数目" />
        </Form.Item>

        <Form.Item
          label="募集保证金"
          name="securityFund"
          help="募集保证金为募集目标的5%，从当前登录钱包地址中进行扣除，节点开始封装时返还"
        >
          <Input readOnly suffix="FIL" placeholder="0" />
        </Form.Item>

        <Form.Item hidden name="securityFundRate">
          <Input />
        </Form.Item>

        <Form.Item
          label="募集截止时间"
          name="deadline"
          help="若未达到募集目标，截止时间后将返还用户质押"
          requiredMark={false}
          rules={[{ required: true, message: '请选择募集截止时间' }]}
        >
          <DateTimePicker
            disabledDate={disabledDate}
            placeholder="YYYY-MM-DD 24:00"
          />
        </Form.Item>

        <Form.Item
          label="选择服务商"
          name="companyId"
          requiredMark={false}
          rules={[{ required: true, message: '请选择服务商' }]}
        >
          <ProviderSelect onSelect={handleSelect} />
        </Form.Item>

        <Form.Item hidden name="spAddress">
          <Input />
        </Form.Item>

        <div className="letsfil-item letsfil-actions text-center">
          <button
            className="btn btn-light"
            type="submit"
            style={{ minWidth: 160 }}
          >
            下一步
          </button>
        </div>
      </Form>
    </>
  );
}
