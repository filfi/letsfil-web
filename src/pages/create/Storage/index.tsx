import { useEffect } from 'react';
import { Form, Input } from 'antd';
import classNames from 'classnames';
import { history, useModel } from '@umijs/max';
import { useMount, useUpdateEffect } from 'ahooks';

import useUser from '@/hooks/useUser';
import * as V from '@/utils/validators';
import { minerInfo } from '@/apis/raise';
import Dialog from '@/components/Dialog';
import SpinBtn from '@/components/SpinBtn';
import { catchify } from '@/utils/hackify';
import { formatAddr } from '@/utils/format';
import useAccount from '@/hooks/useAccount';
import { isDef, sleep } from '@/utils/utils';
import useProviders from '@/hooks/useSProviders';
import FormRadio from '@/components/FormRadio';
import useLoadingify from '@/hooks/useLoadingify';
import AvatarInput from '@/components/AvatarInput';
import ProviderSelect from '@/components/ProviderRadio';

export default function CreateStorage() {
  const [form] = Form.useForm();
  const [model, setModel] = useModel('stepform');

  const { address } = useAccount();
  const { user, createOrUpdate } = useUser();
  const { data: list, isLoading: pFetching } = useProviders();

  useUpdateEffect(() => {
    if (user) {
      form.setFieldsValue({
        sponsorLogo: user.url,
        sponsorCompany: user.name,
      });
    }
  }, [user]);
  useEffect(() => {
    const item = list?.find((i) => i.is_default);

    if (item && !isDef(model?.serviceId)) {
      form.setFieldsValue({
        serviceId: item.id,
        serviceProviderAddress: item.wallet_address,
      });
    }
  }, [list, model?.serviceId]);

  const [fetching, fetchMiner] = useLoadingify(catchify(minerInfo));

  const onMinerChange = async (data: API.MinerAsset) => {
    const isOld = data.sector_count > 0;

    form.setFieldsValue({
      minerType: isOld ? 2 : 1,
      hisBlance: isOld ? data.balance : '0',
      hisPower: isOld ? data.miner_power : '0',
      hisSectorCount: isOld ? data.sector_count : 0,
      hisInitialPledge: isOld ? data.initial_pledge : '0',
      raiseHisPowerRate: isOld ? 90 : 0,
      raiseHisInitialPledgeRate: isOld ? 100 : 0,
    });
  };

  const minerValidator = async (_: unknown, value: string) => {
    if (value) {
      const [e, res] = await fetchMiner(value);

      if (e) {
        return Promise.reject((e as any).code === 3000002 ? '节点不存在' : '检测失败');
      }

      if (res) {
        onMinerChange(res);
      }
    }
  };

  const onServiceSelect = (_: unknown, item: API.Provider) => {
    form.setFieldValue('serviceProviderAddress', item.wallet_address);
  };

  const handleMiner = async (ev?: React.KeyboardEvent | React.MouseEvent) => {
    ev?.preventDefault();

    await form.validateFields(['minerId']);
  };

  useMount(async () => {
    await sleep(300);

    const minerId = model?.minerId ?? '';

    if (minerId && /^(f0|t0)[0-9]+$/i.test(minerId)) {
      handleMiner();
    }
  });

  const [loading, handleSubmit] = useLoadingify(async (vals: API.Base) => {
    const name = user?.name ?? address;
    const { sponsorCompany, sponsorLogo } = vals;

    if (!user || name !== sponsorCompany || user?.url !== sponsorLogo) {
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
          planType: 1,
          minerType: 1,
          // raiser: address,
          sectorSize: 32,
          sectorPeriod: 540,
          sponsorLogo: user?.url,
          sponsorCompany: user?.name ?? address,
          hisBlance: '0',
          hisPower: '0',
          hisInitialPledge: '0',
          hisSectorCount: 0,
          raiseHisPowerRate: 0,
          raiseHisInitialPledgeRate: 0,
          ...model,
          raiser: address ?? model?.raiser,
        }}
        onFinish={handleSubmit}
      >
        <Form.Item hidden name="raiser">
          <Input />
        </Form.Item>
        <Form.Item hidden name="planType">
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
            <h4 className="ffi-label">完善主办人资料</h4>
            <p className="text-gray">
              主办人的名称和Logo都会显示在节点计划中，使用有助于建设者识别的名称，也可以使用机构名称。名称允许修改，会产生Gas费，修改历史会在链上记录。
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
                    <Form.Item name="sponsorCompany" help={<span>钱包地址：{formatAddr(address)}</span>}>
                      <Input maxLength={30} placeholder={address} />
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
              质押资金定向封装到指定存储节点，您需要从技术服务商获得节点号。
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
                      validator: V.Queue.create().add(V.minerID).add(minerValidator).build(),
                    },
                  ]}
                >
                  <Input placeholder="输入存储节点号，如f023456" onPressEnter={handleMiner} />
                </Form.Item>
              </div>
              <div>
                <SpinBtn
                  className="btn btn-outline-light btn-lg text-nowrap"
                  loading={fetching}
                  icon={<i className="bi bi-arrow-repeat"></i>}
                  onClick={handleMiner}
                >
                  检测
                </SpinBtn>
              </div>
            </div>
            <Form.Item name="minerType">
              <FormRadio
                grid
                disabled
                items={[
                  { label: '新建节点', value: 1 },
                  { label: '扩建节点', value: 2 },
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
            <h4 className="ffi-label">技术服务商</h4>
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
            <SpinBtn type="submit" className="btn btn-primary btn-lg w-100" disabled={fetching} loading={fetching || loading}>
              {fetching ? '正在检测节点' : '下一步'}
            </SpinBtn>
          </div>
        </div>
      </Form>
    </>
  );
}
