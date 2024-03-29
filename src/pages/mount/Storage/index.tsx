import { parseEther } from 'viem';
import { Form, Input } from 'antd';
import classNames from 'classnames';
import { useEffect, useMemo } from 'react';
import { history, useModel } from '@umijs/max';
import { useMount, useUpdateEffect } from 'ahooks';

import useUser from '@/hooks/useUser';
import * as V from '@/utils/validators';
import { minerInfo } from '@/apis/raise';
import { catchify } from '@/utils/hackify';
import useAccount from '@/hooks/useAccount';
import Dialog from '@/components/Dialog';
import SpinBtn from '@/components/SpinBtn';
import AvatarInput from '@/components/AvatarInput';
import ProviderSelect from '@/components/ProviderRadio';
import useProviders from '@/hooks/useSProviders';
import useLoadingify from '@/hooks/useLoadingify';
import { accAdd, isDef, sleep } from '@/utils/utils';
import { formatAddr, toFixed, toNumber } from '@/utils/format';

const minerIgnores = ['f02220886', 'f01964215'];

function checkMiner(data: API.MinerAsset, minerId: string) {
  const {
    has_plan,
    fee_debt, // 欠款
    miner_power, // 算力
    initial_pledge, // 扇区质押
    pre_commit_deposits, // 预存款
  } = data;

  // *有募集计划* 或 *有欠款* 或 *无算力* 或 *无质押* 均不可挂载
  let isValid = has_plan === 0 && +fee_debt === 0 && +miner_power > 0 && toNumber(initial_pledge) > 0;

  if (minerIgnores.includes(`${minerId}`.toLowerCase())) {
    return isValid;
  }

  // *有预存款* 不可挂载
  return isValid && +pre_commit_deposits === 0;
}

export default function MountStorage() {
  const [form] = Form.useForm();
  const [model, setModel] = useModel('stepform');
  const minerId: string = Form.useWatch('minerId', form);
  const balance: string = Form.useWatch('hisBlance', form);

  const { address } = useAccount();
  const { user, createOrUpdate } = useUser();
  const { data: list, isLoading: pFetching } = useProviders();

  const formattedBalance = useMemo(() => toNumber(balance), [balance]);

  useUpdateEffect(() => {
    form.setFieldValue('raiser', address);
  }, [address]);
  useUpdateEffect(() => {
    if (user) {
      form.setFieldsValue({
        sponsorLogo: user.url,
        sponsorCompany: user.name,
      });
    }
  }, [user]);
  useUpdateEffect(() => {
    form.setFieldValue('hisPower', '0');
    form.setFieldValue('hisBlance', '0');
  }, [minerId]);
  useEffect(() => {
    const item = list?.find((i) => i.is_default);

    if (item && !isDef(model?.serviceId)) {
      form.setFieldsValue({
        serviceId: item.id,
        serviceProviderAddress: item.wallet_address,
      });
    }
  }, [list, model?.serviceId]);

  const onMinerChange = (data: API.MinerAsset) => {
    const {
      miner_power, // 算力
      available_balance, // 可用余额
      locked_funds, // 锁仓奖励
      initial_pledge, // 扇区质押
    } = data;

    const balance = accAdd(toNumber(available_balance), toNumber(initial_pledge), toNumber(locked_funds));
    form.setFieldValue('hisPower', miner_power);
    form.setFieldValue('hisBlance', parseEther(`${+toFixed(balance, 7)}`).toString());
  };

  const onServiceSelect = (_: unknown, item: API.Provider) => {
    form.setFieldValue('serviceProviderAddress', item.wallet_address);
  };

  const [fetching, fetchMiner] = useLoadingify(catchify(minerInfo));

  const minerValidator = async (rule: unknown, value: string) => {
    if (value) {
      const [e, res] = await fetchMiner(value);

      if (e) {
        return Promise.reject((e as any).code === 3000002 ? '节点不存在' : '检测失败');
      }

      if (res) {
        if (!checkMiner(res, value)) {
          return Promise.reject('节点不可用');
        }

        onMinerChange(res);
      }
    }
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

    history.push('/mount/benefit');
  });

  return (
    <>
      <Form
        form={form}
        size="large"
        layout="vertical"
        initialValues={{
          planOpen: 1,
          planType: 2,
          hisPower: 0,
          hisBlance: 0,
          minerType: 1,
          raiser: address,
          sponsorLogo: user?.url,
          sponsorCompany: user?.name ?? address,
          ...model,
        }}
        onFinish={handleSubmit}
      >
        <Form.Item hidden name="hisBlance">
          <Input />
        </Form.Item>
        <Form.Item hidden name="hisPower">
          <Input />
        </Form.Item>
        <Form.Item hidden name="minerType">
          <Input />
        </Form.Item>
        <Form.Item hidden name="planOpen">
          <Input />
        </Form.Item>
        <Form.Item hidden name="planType">
          <Input />
        </Form.Item>
        <Form.Item hidden name="raiser">
          <Input />
        </Form.Item>

        <div className="ffi-form">
          <div className={classNames('ffi-item border-bottom')}>
            <h4 className="ffi-label">完善主办人资料</h4>
            <p className="text-gray">主办人发起历史节点的分配计划。主办人必须了解历史节点的所有利益结构。</p>

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

          <div className="ffi-item border-bottom">
            <h4 className="ffi-label">Filecoin存储节点</h4>
            <p className="text-gray">
              填写委托给FilFi协议的历史节点的节点号。委托成功意味着该节点的Owner地址将移交给FilFi智能合约。
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
          </div>

          <div className="ffi-item border-bottom">
            <h4 className="ffi-label">Miner余额的处理</h4>
            <p className="text-gray">
              Miner内的余额被视为可分配的激励，FilFi协议会按照计划约定的分配方案执行分配。若不希望留给FilFi智能合约管理，请务必在技术服务商移交Ower地址之前，转出所有余额。
            </p>

            <div className="row">
              <div className="col-12 col-md-8 col-lg-6">
                <p className="ffi-label">Miner当前余额为（余额会随着时间变化）</p>
                <Form.Item noStyle>
                  <Input readOnly suffix="FIL" value={formattedBalance} />
                </Form.Item>
              </div>
            </div>
          </div>

          <div className="ffi-item">
            <h4 className="ffi-label">技术服务商</h4>
            <p className="text-gray">
              历史节点的技术服务商。只有FilFi协议认可的技术服务商的历史节点，才可以委托给FilFi协议。
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
