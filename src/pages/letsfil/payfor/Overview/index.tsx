import { ethers } from 'ethers';
import { Skeleton } from 'antd';
import { useRequest } from 'ahooks';
import { useParams } from '@umijs/max';
import { useMemo, useRef, useState } from 'react';

import styles from './styles.less';
import * as U from '@/utils/utils';
import * as F from '@/utils/format';
import Modal from '@/components/Modal';
import { getInfo } from '@/apis/raise';
import { EventType } from '@/utils/mitt';
import Result from '@/components/Result';
import SpinBtn from '@/components/SpinBtn';
import { planStatusText } from '@/constants';
import useAccounts from '@/hooks/useAccounts';
import { RaiseState } from '@/constants/state';
import useLoadingify from '@/hooks/useLoadingify';
import useEmittHandler from '@/hooks/useEmitHandler';
import usePlanContract from '@/hooks/usePlanContract';

export default function PayforOverview() {
  const params = useParams();
  const address = useRef<string>();

  const { accounts } = useAccounts();
  const plan = usePlanContract(address);
  const [planState, setPlanState] = useState(-1);

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

  const { data, loading, refresh } = useRequest(service, {
    refreshDeps: [params],
    onSuccess: (d) => {
      address.current = d?.raise_address;
      getRaiseState();
    },
  });

  const statusText = useMemo(() => planStatusText[planState], [planState]);
  const isPaied = useMemo(() => planState > RaiseState.WaitPayOPSSecurityFund, [planState]);
  const disabled = useMemo(() => planState !== RaiseState.WaitPayOPSSecurityFund, [planState]);

  const onDepositOPSFund = ({ raiseID }: API.Base) => {
    if (U.isEqual(raiseID, params.id)) {
      console.log('[onRaisePlanStart]: ', raiseID);

      setPlanState(RaiseState.InProgress);
      refresh();
    }
  };

  useEmittHandler({
    [EventType.onCloseRaisePlan]: refresh,
    [EventType.onStartRaisePlan]: refresh,
    [EventType.onChangeOpsPayer]: refresh,
    [EventType.onDepositOPSFund]: onDepositOPSFund,
  });

  const { loading: submitting, run: handleSubmit } = useLoadingify(async () => {
    if (!data || !accounts[0]) return;

    if (accounts[0].toLowerCase() !== data.ops_security_fund_address?.toLowerCase()) {
      Modal.alert({
        icon: 'warn',
        title: '非指定支付地址',
        content: '请在Metamask钱包中切换到募集商指定的支付账户，再进行支付',
        confirmText: '我知道了',
      });
      return;
    }

    await plan.depositOPSFund({
      value: ethers.BigNumber.from(data.ops_security_fund),
    });
  });

  return (
    <div className={styles.content}>
      <Skeleton active loading={loading} paragraph={{ rows: 10 }}>
        {isPaied ? (
          <Result title="支付成功" desc="募集商可进行下一步操作" />
        ) : (
          <>
            <div className="letsfil-form mb-5">
              <div className="letsfil-item">
                <h5 className="letsfil-label">发起账户</h5>
                <p className="mb-0">{data?.raiser}</p>
              </div>

              <div className="letsfil-item">
                <h5 className="letsfil-label">发起单位</h5>
                <p className="mb-0">{data?.sponsor_company}</p>
              </div>

              <div className="letsfil-item">
                <h5 className="letsfil-label">募集目标</h5>
                <p className="mb-0">{F.formatEther(data?.target_amount)} FIL</p>
              </div>

              <div className="letsfil-item">
                <h5 className="letsfil-label">最小募集比例</h5>
                <p className="mb-0">{data?.min_raise_rate}%</p>
              </div>

              <div className="letsfil-item">
                <h5 className="letsfil-label">募集保证金</h5>
                <p className="mb-0">{F.formatEther(data?.security_fund)} FIL</p>
              </div>

              <div className="letsfil-item">
                <h5 className="letsfil-label">运维保证金</h5>
                <p className="mb-0">{F.formatEther(data?.ops_security_fund)} FIL</p>
              </div>

              <div className="letsfil-item">
                <h5 className="letsfil-label">募集截止时间</h5>
                <p className="mb-0">{data?.end_seal_time ? F.formatUnix(data.end_seal_time) : ''}</p>
              </div>

              <div className="letsfil-item">
                <h5 className="letsfil-label">服务商</h5>
                <p className="mb-0">
                  {data?.service_id} {data?.service_provider_address}
                </p>
              </div>

              <div className="letsfil-item">
                <h5 className="letsfil-label">募集商丨投资者丨服务商 权益占比</h5>
                <p className="mb-0">
                  {data?.raiser_share}% | {data?.investor_share}% | {data?.servicer_share}%
                </p>
              </div>

              <div className="letsfil-item">
                <h5 className="letsfil-label">Miner ID</h5>
                <p className="mb-0">{data?.miner_id}</p>
              </div>

              <div className="letsfil-item">
                <h5 className="letsfil-label">节点大小</h5>
                <p className="mb-0">{U.byte2pb(data?.target_power)}PB</p>
              </div>

              <div className="letsfil-item">
                <h5 className="letsfil-label">单个扇区大小</h5>
                <p className="mb-0">{data?.sector_size}GB</p>
              </div>

              <div className="letsfil-item">
                <h5 className="letsfil-label">节点运行周期</h5>
                <p className="mb-0">{U.sec2day(data?.sector_period)}天</p>
              </div>

              <div className="letsfil-item">
                <h5 className="letsfil-label">节点封装期限</h5>
                <p className="mb-0">{U.sec2day(data?.seal_time_limit)}天</p>
              </div>
            </div>

            <div className="px-5 pb-5">
              <SpinBtn className="btn btn-primary w-100" disabled={disabled} loading={submitting} onClick={handleSubmit}>
                {disabled ? statusText : isPaied ? '已支付' : submitting ? '正在支付' : '支付运维保证金'}
              </SpinBtn>
            </div>
          </>
        )}
      </Skeleton>
    </div>
  );
}
