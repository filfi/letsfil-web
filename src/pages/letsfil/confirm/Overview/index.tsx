import { Skeleton } from 'antd';
import classNames from 'classnames';
import { useRequest } from 'ahooks';
import { useParams } from '@umijs/max';
import { useMemo, useState } from 'react';

import styles from './styles.less';
import * as U from '@/utils/utils';
import * as F from '@/utils/format';
import Modal from '@/components/Modal';
import { getInfo } from '@/apis/raise';
import { EventType } from '@/utils/mitt';
import Result from '@/components/Result';
import SpinBtn from '@/components/SpinBtn';
import { planStatusText } from '@/constants';
import ShareBtn from '@/components/ShareBtn';
import useAccounts from '@/hooks/useAccounts';
import useProvider from '@/hooks/useProvider';
import { RaiseState } from '@/constants/state';
import usePlanState from '@/hooks/usePlanState';
import useLoadingify from '@/hooks/useLoadingify';
import useEmittHandler from '@/hooks/useEmitHandler';
import { ReactComponent as IconCopy } from '@/assets/icons/copy-light.svg';
import { ReactComponent as IconCheck } from '@/assets/icons/check-filled.svg';

export default function ConfirmOverview() {
  const params = useParams();

  const { accounts } = useAccounts();
  const { renderLabel } = useProvider();
  const [address, setAddress] = useState<string>();
  const { contract, planState, setPlanState } = usePlanState(address);

  const service = async () => {
    if (params.id) {
      return await getInfo(params.id);
    }

    return undefined;
  };

  const { data, loading, refresh } = useRequest(service, {
    refreshDeps: [params],
    onSuccess: (d) => {
      setAddress(d?.raise_address);
    },
  });

  const statusText = useMemo(() => planStatusText[planState], [planState]);
  const disabled = useMemo(() => planState !== RaiseState.WaitSeverSign, [planState]);
  const isSigned = useMemo(() => planState > RaiseState.WaitSeverSign, [planState]);

  const onStartRaisePlan = ({ raiseID }: API.Base) => {
    if (U.isEqual(raiseID, params.id)) {
      console.log('[onRaisePlanStart]: ', raiseID);

      setPlanState(RaiseState.InProgress);
      refresh();
    }
  };

  useEmittHandler({ [EventType.onStartRaisePlan]: onStartRaisePlan });

  const getCommand = () => {
    const address = contract.getContract()?.address;

    return `lotus-miner actor set-owner --really-do-it ${U.toF4Address(address)} <ownerAddress>`;
  };

  const { loading: submitting, run: handleSubmit } = useLoadingify(async () => {
    if (!data || !accounts[0]) return;

    if (!U.isEqual(accounts[0], data.service_provider_address)) {
      Modal.alert({
        icon: 'warn',
        title: '非指定服务商地址',
        content: '请在Metamask钱包中切换到募集商指定的服务商支付账户，再进行支付',
        confirmText: '我知道了',
      });
      return;
    }

    await contract.startRaisePlan();
  });

  return (
    <div className={styles.content}>
      <Skeleton active loading={loading} paragraph={{ rows: 10 }}>
        {isSigned ? (
          <Result title="确认成功" desc="该募集计划将显示在市场列表中" />
        ) : (
          <>
            <h4 className={styles.title}>确认信息</h4>

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
                <p className="mb-0">{renderLabel(data?.service_id)}</p>
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

            <h4 className={styles.title}>变更受益人到智能合约地址</h4>

            <div className="px-4 mb-5">
              <div className={styles.tips}>
                <p className="d-flex align-items-center mb-0">
                  <IconCheck />
                  <span className="ms-2">变更受益人需要在您保存私钥的电脑上完成</span>
                </p>
                <hr />
                <p className="d-flex align-items-center mb-0">
                  <IconCheck />
                  <span className="ms-2">点击命令行任意位置复制代码</span>
                </p>
                <hr />
                <p className="d-flex align-items-center mb-0">
                  <IconCheck />
                  <span className="ms-2">在您电脑上的终端粘贴，回车即可执行变更操作</span>
                </p>
                <hr />
              </div>

              <div className={classNames('card mb-4', styles.card)}>
                <div className={classNames('d-flex align-items-start', styles.code)}>
                  <span>$</span>
                  <p className={classNames('flex-fill mx-1 mb-0 fw-bold text-break', styles.command)}>{getCommand()}</p>
                  <ShareBtn className="btn btn-link text-reset p-0" text={getCommand()}>
                    <IconCopy />
                  </ShareBtn>
                </div>
              </div>

              <div className="px-5 pb-5">
                <SpinBtn className="btn btn-primary w-100" disabled={disabled} loading={submitting} onClick={handleSubmit}>
                  {disabled && statusText ? statusText : isSigned ? '已确认' : submitting ? '正在确认' : '信息无误且已完成操作，确认'}
                </SpinBtn>
              </div>
            </div>
          </>
        )}
      </Skeleton>
    </div>
  );
}
