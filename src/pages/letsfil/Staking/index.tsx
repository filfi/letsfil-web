import { ethers } from 'ethers';
import { Form, Input, Skeleton } from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { Link, history, useParams } from '@umijs/max';
import { useBoolean, useMemoizedFn, useRequest, useUpdateEffect } from 'ahooks';

import styles from './styles.less';
import * as F from '@/utils/format';
import * as U from '@/utils/utils';
import { getInfo } from '@/apis/raise';
import { EventType } from '@/utils/mitt';
import Result from '@/components/Result';
import SpinBtn from '@/components/SpinBtn';
import { number } from '@/utils/validators';
import ShareBtn from '@/components/ShareBtn';
import { RaiseState } from '@/constants/state';
import Breadcrumb from '@/components/Breadcrumb';
import PageHeader from '@/components/PageHeader';
import usePlanState from '@/hooks/usePlanState';
import useProcessify from '@/hooks/useProcessify';
import useEmittHandler from '@/hooks/useEmitHandler';
import useDepositInvest from '@/hooks/useDepositInvest';
import { SCAN_URL, planStatusText } from '@/constants';
import { ReactComponent as Share4 } from '@/assets/icons/share-04.svg';
import { ReactComponent as Share6 } from '@/assets/icons/share-06.svg';

export default function Staking() {
  const params = useParams();
  const [form] = Form.useForm();

  const [invested, setInvested] = useState(0);
  const [success, { setTrue }] = useBoolean(false);
  const [address, setAddress] = useState<string>();
  const { totalPledge } = useDepositInvest(address);
  const { contract, planState } = usePlanState(address);

  const service = async () => {
    if (params.id) {
      return await getInfo(params.id);
    }

    return undefined;
  };

  const { data, loading, refresh } = useRequest(service, { refreshDeps: [params] });

  const onDataChange = () => {
    setAddress(data?.raise_address);
  };

  const raiseId = useMemo(() => data?.raising_id, [data]);
  const total = useMemo(() => F.toNumber(data?.target_amount), [data]);
  const remain = useMemo(() => U.accSub(total, totalPledge), [total, totalPledge]);
  const readOnly = useMemo(() => remain < 10, [remain]);

  const amountValidator = useMemoizedFn(async (_: unknown, value: string) => {
    await number(_, value);

    if (value) {
      if (remain > 10 && +value < 10) {
        return Promise.reject(`最少 10 FIL`);
      }

      if (+value > remain) {
        return Promise.reject(`最多可质押 ${remain} FIL`);
      }
    }

    return Promise.resolve();
  });

  const onStaking = useMemoizedFn((res: API.Base) => {
    console.log('[onStaking]: ', res);

    const amount = res.amount.toString();
    const raiseID = res.raiseID.toString();

    if (U.isEqual(raiseId, raiseID)) {
      setInvested(F.toNumber(amount));
      setTrue();
      refresh();
    }
  });

  useEffect(() => {
    if (remain < 10) {
      form.setFieldValue('amount', `${remain}`);
    }
  }, [remain]);
  useUpdateEffect(onDataChange, [data]);
  useEmittHandler({
    [EventType.onStaking]: onStaking,
  });

  const [stakeLoading, handleStaking] = useProcessify(async () => {
    const amount = form.getFieldValue('amount');

    await contract.staking({
      value: ethers.utils.parseEther(`${amount}`),
    });
  });

  const renderForm = () => {
    const disabled = planState !== RaiseState.InProgress;
    const stateText = planStatusText[planState];

    return (
      <Form form={form} layout="vertical" onFinish={handleStaking}>
        <Form.Item required name="amount" label="输入投资额度" rules={[{ required: true, message: '请输入投资额度' }, { validator: amountValidator }]}>
          <Input readOnly={disabled || readOnly} placeholder="最低10 FIL" suffix="FIL" />
        </Form.Item>

        <div className="d-flex flex-wrap gap-3">
          <button type="button" className="btn btn-light btn-lg flex-fill" onClick={() => history.back()}>
            取消
          </button>

          <SpinBtn type="submit" disabled={disabled} loading={stakeLoading} className="btn btn-primary btn-lg flex-fill">
            {stakeLoading ? '正在处理' : disabled && stateText ? stateText : '确认'}
          </SpinBtn>
        </div>
      </Form>
    );
  };

  const renderContent = () => {
    if (success) {
      return (
        <Result title={`成功投资 ${F.formatAmount(invested)} FIL`} desc={`如果 ${F.formatSecDate(data?.end_seal_time)} 募集目标未达成，您的投资额将返还`}>
          <p>
            <Link className="btn btn-primary btn-lg w-100" replace to={`/letsfil/overview/${params.id}`}>
              查看计划详情
            </Link>
          </p>
          <p>
            <Link className="btn btn-outline-light btn-lg border-0 w-100" replace to="/letsfil/raising">
              <i className="bi bi-arrow-left"></i>
              <span className="ms-2">回到目录页</span>
            </Link>
          </p>
        </Result>
      );
    }

    return (
      <>
        <div className="letsfil-form">
          <p className="mb-3">
            <img src={require('./imgs/icon-fil.png')} width={48} />
          </p>

          <div className="letsfil-item mb-4">
            <h4 className="letsfil-label">募集方：{data?.sponsor_company}</h4>
            <p className="mb-0">如果募集目标未达成，您的投资额将返还至原账户</p>
          </div>

          <div className="letsfil-item mb-4">
            <h4 className="letsfil-label">募集目标：{total} FIL</h4>
            <p className="mb-0">
              已募集 {F.formatAmount(totalPledge)} FIL，您最多还可投 {F.formatAmount(remain)} FIL
            </p>
          </div>

          {renderForm()}
        </div>
      </>
    );
  };

  return (
    <div className="container">
      <Breadcrumb items={[{ title: '全部募集计划', route: '/letsfil/raising' }, { title: data?.sponsor_company ?? '' }]} />

      <PageHeader title={`FIL募集计划 - ${F.formatNum(total, '0a')} - ${data?.sponsor_company ?? ''}`}>
        {data && (
          <div className="d-flex align-items-center gap-3">
            <ShareBtn className="btn btn-light" text={location.href} toast="链接已复制">
              <Share4 />
            </ShareBtn>
            <a className="btn btn-light text-nowrap" href={`${SCAN_URL}/${data.raise_address}`} target="_blank" rel="noreferrer">
              <Share6 />
              <span className="ms-1">查看智能合约</span>
            </a>
          </div>
        )}
      </PageHeader>

      <div className={styles.content}>
        <Skeleton active loading={loading} paragraph={{ rows: 5 }}>
          {renderContent()}
        </Skeleton>
      </div>
    </div>
  );
}
