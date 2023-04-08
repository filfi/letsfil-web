import { Form, Input, Select } from 'antd';
import { history, useModel } from '@umijs/max';

export default function CreateBuild() {
  const [form] = Form.useForm();
  const [data, setData] = useModel('stepform');

  const handleSubmit = (vals: API.Base) => {
    setData((d) => ({ ...d, ...vals }));

    history.push('/letsfil/create/confirm');
  };

  return (
    <>
      <Form form={form} layout="vertical" initialValues={data ?? {}} onFinish={handleSubmit}>
        <Form.Item label="Miner ID" name="minerID" rules={[{ required: true, message: '请输入Miner ID' }]}>
          <Input placeholder="如：F053746" />
        </Form.Item>

        <Form.Item label="单个扇区大小" name="sectorSize" rules={[{ required: true, message: '请选择单个扇区大小' }]}>
          <Select
            placeholder="请选择"
            options={[
              { value: 0, label: '32GB' },
              { value: 1, label: '64GB' },
            ]}
          />
        </Form.Item>

        <Form.Item label="节点运行周期" name="nodePeriod" rules={[{ required: true, message: '请选择节点运行周期' }]}>
          <Select
            placeholder="请选择"
            options={[
              { value: 0, label: '90天' },
              { value: 1, label: '120天' },
              { value: 2, label: '180天' },
              { value: 3, label: '240天' },
              { value: 4, label: '360天' },
            ]}
          />
        </Form.Item>

        <Form.Item
          label="封装期限"
          name="sealPeriod"
          help="募集成功后需在该期限内封装完毕并投入生产，否则会产生罚金"
          rules={[{ required: true, message: '请输入天数，不大于30' }]}
        >
          <Input type="number" suffix="天" max={30} min={0} placeholder="请输入天数，不大于30" />
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
