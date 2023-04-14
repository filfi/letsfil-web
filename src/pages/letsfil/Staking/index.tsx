import { ethers } from 'ethers';
import { Form, Input, Skeleton } from 'antd';
import { useRequest, useUpdateEffect } from 'ahooks';
import { Link, history, useParams } from '@umijs/max';
import { useEffect, useMemo, useRef, useState } from 'react';

import styles from './styles.less';
import * as F from '@/utils/format';
import * as U from '@/utils/utils';
import { getInfo } from '@/apis/raise';
import { EventType } from '@/utils/mitt';
import Result from '@/components/Result';
import SpinBtn from '@/components/SpinBtn';
import { number } from '@/utils/validators';
import { planStatusText } from '@/constants';
import ShareBtn from '@/components/ShareBtn';
import Breadcrumb from '@/components/Breadcrumb';
import PageHeader from '@/components/PageHeader';
import useLoadingify from '@/hooks/useLoadingify';
import useEmittHandler from '@/hooks/useEmitHandler';
import usePlanContract from '@/hooks/usePlanContract';
import { ReactComponent as Share4 } from '@/assets/icons/share-04.svg';
import { ReactComponent as Share6 } from '@/assets/icons/share-06.svg';

export default function Staking() {
  const params = useParams();
  const address = useRef<string>();

  const [form] = Form.useForm();
  const amount = Form.useWatch('amount', form);
  const plan = usePlanContract(address);
  const [success, setSuccess] = useState(false);
  const [planState, setPlanState] = useState(-1);
  const [totalAmount, setTotalAmount] = useState(0);

  const service = async () => {
    if (params.id) {
      return await getInfo(params.id);
    }

    return undefined;
  };

  const getRaiseState = async () => {
    const raiseState = await plan.getRaiseState();

    console.log('[raiseState]: ', raiseState);

    setPlanState(raiseState ?? -1);
  };

  const getAmounts = async () => {
    const totalAmount = await plan.pledgeTotalAmount();
    setTotalAmount(F.toNumber(totalAmount));
  };

  const { data, loading, refresh } = useRequest(service, { refreshDeps: [params] });

  const onDataChange = () => {
    address.current = data?.raise_address;

    getRaiseState();
    getAmounts();
  };

  const raiseId = useMemo(() => data?.raising_id, [data]);
  const total = useMemo(() => F.toNumber(data?.target_amount), [data]);
  const remain = useMemo(() => U.accSub(total, totalAmount), [total, totalAmount]);
  const disabled = useMemo(() => remain < 10, [remain]);

  const amountValidator = async (_: unknown, value: string) => {
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
  };

  const onStaking = (res: API.Base) => {
    console.log('[onStaking]: ', res);

    const raiseID = res.raiseID.toString();

    if (U.isEqual(raiseId, raiseID)) {
      setSuccess(true);
      refresh();
    }
  };

  useEffect(() => {
    if (remain < 10) {
      form.setFieldValue('amount', `${remain}`);
    }
  }, [remain]);
  useUpdateEffect(onDataChange, [data]);
  useEmittHandler({
    [EventType.onStaking]: onStaking,
  });

  const { loading: stakeLoading, run: handleStaking } = useLoadingify(async () => {
    await plan.staking({
      value: ethers.utils.parseEther(`${amount}`),
    });
  });

  return (
    <div className="container">
      <Breadcrumb items={[{ title: '全部募集计划', route: '/letsfil/raising' }, { title: data?.sponsor_company ?? '' }]} />

      <PageHeader title={`FIL募集计划 - ${F.formatNum(total, '0a')} - ${data?.sponsor_company ?? ''}`}>
        <div className="d-flex align-items-center gap-3">
          <ShareBtn className="btn btn-light" text={location.href} toast="链接已复制">
            <Share4 />
          </ShareBtn>
          <button type="button" className="btn btn-light text-nowrap">
            <Share6 />
            <span className="ms-1">查看智能合约</span>
          </button>
        </div>
      </PageHeader>

      <div className={styles.content}>
        <Skeleton active loading={loading} paragraph={{ rows: 10 }}>
          {success ? (
            <Result title={`成功投资 ${amount} FIL`} desc={`如果 ${F.formatSecDate(data?.end_seal_time)} 募集目标未达成，您的投资额将返还`}>
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
          ) : (
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
                    已募集 {totalAmount} FIL，您最多还可投 {remain} FIL
                  </p>
                </div>

                {planState === 3 ? (
                  <>
                    <Form form={form} layout="vertical" onFinish={handleStaking}>
                      <Form.Item
                        required
                        name="amount"
                        label="输入投资额度"
                        requiredMark={false}
                        rules={[{ required: true, message: '请输入投资额度' }, { validator: amountValidator }]}
                      >
                        <Input disabled={disabled} placeholder="最低10 FIL" suffix="FIL" />
                      </Form.Item>

                      <div className="d-flex flex-wrap gap-3">
                        <button type="button" className="btn btn-light btn-lg flex-fill" onClick={() => history.back()}>
                          取消
                        </button>
                        <SpinBtn type="submit" loading={stakeLoading} className="btn btn-primary btn-lg flex-fill">
                          确认
                        </SpinBtn>
                      </div>
                    </Form>
                  </>
                ) : (
                  <button type="button" className="btn btn-light btn-lg" disabled>
                    {planStatusText[planState]}
                  </button>
                )}
              </div>
            </>
          )}
        </Skeleton>
      </div>
    </div>
  );
}
