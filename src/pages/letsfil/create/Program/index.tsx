import { Form, Input } from 'antd';
import { useEffect, useMemo } from 'react';
import { useMount, useRequest } from 'ahooks';
import { history, useModel } from '@umijs/max';

import { statChainInfo } from '@/apis/raise';
import useAccounts from '@/hooks/useAccounts';
import * as validators from '@/utils/validators';
import { accMul, disabledDate } from '@/utils/utils';
import DateTimePicker from '@/components/DateTimePicker';
import ProviderSelect from '@/components/ProviderSelect';

async function targetValidator(rule: unknown, value: string) {
  await validators.integer(rule, value);

  if (value && +value > 2500000) {
    return Promise.reject('不超过 2,500,000 FIL');
  }
}

export default function CreateProgram() {
  const [form] = Form.useForm();
  const { accounts } = useAccounts();
  const [data, setData] = useModel('stepform');

  const nodeSize = Form.useWatch('nodeSize', form);
  const amount = Form.useWatch('targetAmount', form);
  const rate = Form.useWatch('securityFundRate', form);

  const { data: stat } = useRequest(statChainInfo, { retryCount: 3 });

  const perTera = useMemo(() => stat?.pledge_per_tera ?? 0, [stat]);
  const targetFil = useMemo(() => {
    const val = accMul(accMul(nodeSize, 1024), perTera);
    return Number.isNaN(val) ? 0 : val;
  }, [nodeSize, perTera]);

  useEffect(() => {
    let val = 0;

    if (amount && rate) {
      console.log(amount, rate);
      val = accMul(amount, `${rate}`);
    }

    form.setFieldValue('securityFund', Number.isNaN(val) ? 0 : val);
  }, [amount, rate]);

  useEffect(() => {
    if (accounts[0]) {
      const val = form.getFieldValue('sponsor');

      if (!val) {
        form.setFieldValue('sponsor', accounts[0]);
      }
    }
  }, [accounts]);

  useMount(() => {
    form.setFieldValue('securityFundRate', 0.05);
  });

  const handleFill = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault();

    form.setFieldValue('targetAmount', targetFil);
  };

  const handleSelect = (_: unknown, item: API.Base) => {
    form.setFieldValue('spAddress', item.wallet_address);
  };

  const handleSubmit = (vals: API.Base) => {
    setData((d) => ({ ...d, ...vals }));

    history.push('/letsfil/create/allocation');
  };

  return (
    <>
      <Form form={form} layout="vertical" initialValues={data ?? {}} onFinish={handleSubmit}>
        <Form.Item label="发起账户" name="sponsor">
          <Input readOnly placeholder="请输入发起账户" />
        </Form.Item>

        <Form.Item label="发起单位" name="raiseCompany" rules={[{ required: true, message: '请输入发起单位' }]}>
          <Input maxLength={56} placeholder="如：XX科技有限公司" />
        </Form.Item>

        <Form.Item
          label="封装节点大小"
          name="nodeSize"
          help="单位进制按1024算"
          rules={[{ required: true, message: '请输入封装节点大小', validator: validators.number }]}
        >
          <Input suffix="PB" placeholder="请输入数目" />
        </Form.Item>

        <Form.Item
          label="募集目标"
          name="targetAmount"
          rules={[{ required: true, message: '请输入募集目标' }, { validator: targetValidator }]}
          help={
            <>
              <span className="me-2">根据节点大小，约需要{targetFil} FIL</span>
              <a href="#" onClick={handleFill}>
                填入
              </a>
            </>
          }
        >
          <Input suffix="FIL" placeholder="请输入数目" />
        </Form.Item>

        <Form.Item
          label="最小募集比例"
          name="minRaiseRate"
          help="募集截止时，募集额达到目标的最小募集比例即可视为募集成功，例如：募集目标为100 FIL，最小募集比例为80%，那最终募集到80 FIL即可视为募集成功"
          rules={[{ required: true, message: '请输入募集目标' }, { validator: validators.minRaiseRate }]}
        >
          <Input type="number" suffix="%" max={100} min={10} placeholder="请输入百分比，不低于10%，建议80%" />
        </Form.Item>

        <Form.Item label="募集保证金" name="securityFund" help="募集保证金为募集目标的5%，从当前登录钱包地址中进行扣除，节点开始封装时返还">
          <Input readOnly suffix="FIL" placeholder="0" />
        </Form.Item>

        <Form.Item hidden name="securityFundRate">
          <Input />
        </Form.Item>

        <Form.Item
          label="募集截止时间"
          name="deadline"
          help="若未达到募集目标，截止时间后将返还用户质押"
          rules={[{ required: true, message: '请选择募集截止时间' }]}
        >
          <DateTimePicker disabledDate={disabledDate} placeholder="YYYY-MM-DD 24:00" />
        </Form.Item>

        <Form.Item label="选择服务商" name="companyId" rules={[{ required: true, message: '请选择服务商' }]}>
          <ProviderSelect onSelect={handleSelect} />
        </Form.Item>

        <Form.Item hidden name="spAddress">
          <Input />
        </Form.Item>

        <div className="letsfil-item letsfil-actions text-center">
          <button className="btn btn-light" type="submit" style={{ minWidth: 160 }}>
            下一步
          </button>
        </div>
      </Form>
    </>
  );
}
