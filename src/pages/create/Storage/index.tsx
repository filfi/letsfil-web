import { Form, Input } from 'antd';
import classNames from 'classnames';
import { history, useModel } from '@umijs/max';
import { useDebounceFn, useLockFn, useUpdateEffect } from 'ahooks';

import { isDef } from '@/utils/utils';
import useUser from '@/hooks/useUser';
import { minerInfo } from '@/apis/raise';
import Dialog from '@/components/Dialog';
// import Modal from '@/components/Modal';
import SpinBtn from '@/components/SpinBtn';
import { catchify } from '@/utils/hackify';
import { formatAddr } from '@/utils/format';
import useAccounts from '@/hooks/useAccounts';
import useProviders from '@/hooks/useProviders';
import FormRadio from '@/components/FormRadio';
import * as validators from '@/utils/validators';
import useLoadingify from '@/hooks/useLoadingify';
import AvatarInput from '@/components/AvatarInput';
import ProviderSelect from '@/components/ProviderRadio';

export default function CreateStorage() {
  const [form] = Form.useForm();
  const { account } = useAccounts();
  const [model, setModel] = useModel('stepform');
  const { user, createOrUpdate } = useUser();
  const { list, loading: pFetching } = useProviders();

  useUpdateEffect(() => {
    form.setFieldValue('raiser', account);
  }, [account]);
  useUpdateEffect(() => {
    if (user) {
      form.setFieldsValue({
        sponsorLogo: user.url,
        sponsorCompany: user.name,
      });
    }
  }, [user]);
  useUpdateEffect(() => {
    const item = list?.find((i) => i.is_default);

    if (item && !isDef(model?.serviceId)) {
      form.setFieldsValue({
        serviceId: item.id,
        serviceProviderAddress: item.wallet_address,
      });
    }
  }, [list, model?.serviceId]);

  const [mining, getMiner] = useLoadingify(async (id: string) => {
    const r = await catchify(minerInfo)(id);
    const [, res] = r;
    const isOld = res && res?.sector_count > 0;

    form.setFieldsValue({
      minerType: isOld ? 2 : 1,
      hisBlance: isOld ? res.balance : '0',
      hisPower: isOld ? res.miner_power : '0',
      hisInitialPledge: isOld ? res.initial_pledge : '0',
      hisSectorCount: isOld ? res.sector_count : 0,
      raiseHisPowerRate: isOld ? 90 : 0,
      raiseHisInitialPledgeRate: isOld ? 100 : 0,
    });

    return r;
  });

  const { run: validateMiner } = useDebounceFn(useLockFn(getMiner), { wait: 500, trailing: true });

  const minerValidator = async (rule: unknown, value: string) => {
    const [e] = await catchify(validators.minerID)(rule, value);

    if (e) {
      return e;
    }

    if (value) {
      const res = await validateMiner(value);

      if (res?.[0]) {
        return Promise.reject('无效的节点，请重新输入');
      }
    }
  };

  const onServiceSelect = (_: unknown, item: API.Provider) => {
    form.setFieldValue('serviceProviderAddress', item.wallet_address);
  };

  const handleMiner = async (ev: React.KeyboardEvent | React.MouseEvent) => {
    ev.preventDefault();

    await form.validateFields(['minerId']);
  };

  const [loading, handleSubmit] = useLoadingify(async (vals: API.Base) => {
    const { sponsorCompany, sponsorLogo } = vals;

    if (!user || user?.name !== sponsorCompany || user?.url !== sponsorLogo) {
      const [e] = await catchify(createOrUpdate)({ name: sponsorCompany, url: sponsorLogo });

      if (e) {
        Dialog.alert({
          icon: 'error',
          title: '提交失败',
          content: e.message,
        });
      }
    }

    setModel((d) => ({ ...d, ...vals }));

    history.push('/create/program');
  });

  return (
    <>
      <Form
        form={form}
        size="large"
        layout="vertical"
        initialValues={{
          minerType: 1,
          raiser: account,
          sectorSize: 32,
          sectorPeriod: 540,
          sponsorLogo: user?.url,
          sponsorCompany: user?.name,
          hisBlance: '0',
          hisPower: '0',
          hisInitialPledge: '0',
          hisSectorCount: 0,
          raiseHisPowerRate: 0,
          raiseHisInitialPledgeRate: 0,
          ...model,
        }}
        onFinish={handleSubmit}
      >
        <Form.Item hidden name="raiser">
          <Input />
        </Form.Item>
        <Form.Item hidden name="hisBlance">
          <Input />
        </Form.Item>
        <Form.Item hidden name="hisPower">
          <Input />
        </Form.Item>
        <Form.Item hidden name="hisInitialPledge">
          <Input />
        </Form.Item>
        <Form.Item hidden name="hisSectorCount">
          <Input />
        </Form.Item>
        <Form.Item hidden name="raiseHisPowerRate">
          <Input />
        </Form.Item>
        <Form.Item hidden name="raiseHisInitialPledgeRate">
          <Input />
        </Form.Item>

        <div className="ffi-form">
          <div className={classNames('ffi-item border-bottom')}>
            <h4 className="ffi-label">完善建设者资料</h4>
            <p className="text-gray">
              建设者的名称和Logo都会显示在节点计划中，使用有助于参建者识别的名称，也可以使用机构名称。名称允许修改，会产生Gas费，修改历史会在链上记录。
            </p>

            <div className="d-flex gap-3">
              <div className="flex-shrink-0">
                <Form.Item noStyle name="sponsorLogo">
                  <AvatarInput size={60} />
                </Form.Item>
              </div>
              <div className="flex-grow-1">
                <div className="row">
                  <div className="col-12 col-md-8 col-lg-6">
                    <Form.Item
                      name="sponsorCompany"
                      help={<span>钱包地址：{formatAddr(account)}</span>}
                      rules={[{ required: true, message: '请输入您的名称' }]}
                    >
                      <Input maxLength={30} placeholder="输入您的名称" />
                    </Form.Item>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* <div className="ffi-item border-bottom">
            <h4 className="ffi-label mb-3">节点计划名称</h4>

            <Form.Item
              name="raisingName"
              rules={[{ required: true, message: '请输入名称' }]}
            >
              <Input maxLength={64} placeholder="输入名称" />
            </Form.Item>
          </div> */}

          <div className="ffi-item border-bottom">
            <h4 className="ffi-label">Filecoin存储节点</h4>
            <p className="text-gray">
              集合质押资金定向封装到指定存储节点，您需要从技术服务商获得节点号。
              {/* <a className="text-underline" href="#minerId-modal" data-bs-toggle="modal">
                什么是存储节点号？
              </a> */}
            </p>

            <div className="d-flex gap-2">
              <div className="flex-fill">
                <Form.Item
                  name="minerId"
                  rules={[
                    { required: true, message: '请输入节点号' },
                    {
                      validator: minerValidator,
                    },
                  ]}
                >
                  <Input placeholder="输入存储节点号，如f023456" onPressEnter={handleMiner} />
                </Form.Item>
              </div>
              <div>
                <SpinBtn className="btn btn-outline-light btn-lg text-nowrap" loading={mining} onClick={handleMiner}>
                  <i className="bi bi-arrow-repeat"></i>
                  <span className="ms-2">检测</span>
                </SpinBtn>
              </div>
            </div>
            <Form.Item name="minerType">
              <FormRadio
                grid
                disabled
                items={[
                  { label: '新建DC节点', value: 1 },
                  { label: '已有节点扩展算力', value: 2 },
                ]}
              />
            </Form.Item>
          </div>

          <div className="ffi-item border-bottom">
            <h4 className="ffi-label">Filecoin存储方案</h4>
            <p className="text-gray">选择封装扇区的参数</p>

            <Form.Item name="sectorSize" rules={[{ required: true, message: '请选择存储方案' }]}>
              <FormRadio
                items={[
                  { label: '32GB 扇区', value: 32 },
                  { label: '64GB 扇区', value: 64 },
                ]}
              />
            </Form.Item>
            <Form.Item name="sectorPeriod" rules={[{ required: true, message: '请选择存储方案' }]}>
              <FormRadio
                items={[
                  { label: '210 天到期', value: 210 },
                  { label: '360 天到期', value: 360 },
                  { label: '540 天到期', value: 540 },
                ]}
              />
            </Form.Item>
          </div>

          <div className="ffi-item">
            <h4 className="ffi-label">技术服务商（SP Foundry）</h4>
            <p className="text-gray">
              技术服务商提供扇区封装、技术运维、IDC数据中心整体解决方案，是存储节点长期健康运行的最终保障。
              {/* <a className="text-underline" href="#provider-modal" data-bs-toggle="modal">
                如何成为技术服务商(SP Foundry)？
              </a> */}
            </p>

            <Form.Item name="serviceId" rules={[{ required: true, message: '请选择技术服务商' }]}>
              <ProviderSelect options={list} loading={pFetching} onSelect={onServiceSelect} />
            </Form.Item>
            <Form.Item hidden name="serviceProviderAddress">
              <Input />
            </Form.Item>
          </div>
        </div>

        <div className="border-top my-4"></div>

        <div className="ffi-form">
          <div className="ffi-form-actions">
            <SpinBtn type="submit" className="btn btn-primary btn-lg w-100" loading={loading}>
              下一步
            </SpinBtn>
          </div>
        </div>
      </Form>

      {/* <Modal.Alert id="minerId-modal" title="什么是存储节点号？" confirmText="我知道了">
        <div className="card bg-transparent border-0">
          <div className="card-body">
            <p>节点号解释</p>
            <p>节点号解释</p>
            <p className="mb-0">节点号解释</p>
          </div>
        </div>
      </Modal.Alert>

      <Modal.Alert id="provider-modal" title="如何成为技术服务商(SP Foundry)？" confirmText="我知道了">
        <div className="card bg-transparent border-0">
          <div className="card-body">
            <p>技术服务商</p>
            <p>技术服务商</p>
            <p className="mb-0">技术服务商</p>
          </div>
        </div>
      </Modal.Alert> */}
    </>
  );
}
