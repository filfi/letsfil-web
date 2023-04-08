import { Skeleton } from 'antd';
import { ethers } from 'ethers';
import classNames from 'classnames';
import { useRequest } from 'ahooks';
import { useModel, useParams } from '@umijs/max';
import { useMemo, useRef, useState } from 'react';

import * as U from '@/utils/utils';
import styles from './styles.less';
import { getInfo } from '@/apis/raise';
import Modal from '@/components/Modal';
import toastify from '@/utils/toastify';
import { EventType } from '@/utils/mitt';
import Result from '@/components/Result';
import SpinBtn from '@/components/SpinBtn';
import { formatUnix } from '@/utils/format';
import useProvider from '@/hooks/useProvider';
import { RaiseState } from '@/constants/state';
import useLoadingify from '@/hooks/useLoadingify';
import useEmittHandler from '@/hooks/useEmitHandler';
import usePlanContract from '@/hooks/usePlanContract';
import { ReactComponent as IconCopy } from '@/assets/icons/copy-light.svg';
import { ReactComponent as IconCheck } from '@/assets/icons/check-filled.svg';

export default function ConfirmOverview() {
  const params = useParams();
  const address = useRef<string>();

  const [accounts] = useModel('accounts');
  const { renderLabel } = useProvider();
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

  const disabled = useMemo(() => planState !== RaiseState.WaitSeverSign, [planState]);
  const isSigned = useMemo(() => planState > RaiseState.WaitSeverSign, [planState]);

  const onStartRaisePlan = ({ raiseID }: API.Base) => {
    if (U.isEqual(raiseID, params.id)) {
      console.log('[onRaisePlanStart]: ', raiseID);

      setPlanState(RaiseState.InProgress);
      refresh();
    }
  };

  useEmittHandler({ [EventType.OnStartRaisePlan]: onStartRaisePlan });

  const handleSwitch = () => {};

  const { loading: submitting, run: handleSubmit } = useLoadingify(async () => {
    if (!data || !accounts[0]) return;

    if (accounts[0].toLowerCase() !== data.service_provider_address?.toLowerCase()) {
      Modal.alert({
        icon: 'warn',
        title: '非指定服务商地址',
        content: '请用募集商指定的服务商账户登录并确认计划',
        confirmText: '切换钱包地址',
        onConfirm: handleSwitch,
      });
      return;
    }

    await toastify(async () => {
      return await U.withTx(plan.startRaisePlan());
    })();
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
                <p className="mb-0">{ethers.utils.formatEther(data?.target_amount ?? 0)} FIL</p>
              </div>

              <div className="letsfil-item">
                <h5 className="letsfil-label">募集保证金</h5>
                <p className="mb-0">{ethers.utils.formatEther(data?.security_fund ?? 0)} FIL</p>
              </div>

              <div className="letsfil-item">
                <h5 className="letsfil-label">运维保证金</h5>
                <p className="mb-0">{ethers.utils.formatEther(data?.ops_security_fund ?? 0)} FIL</p>
              </div>

              <div className="letsfil-item">
                <h5 className="letsfil-label">募集截止时间</h5>
                <p className="mb-0">{data?.end_seal_time ? formatUnix(data.end_seal_time) : ''}</p>
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

              <div className={classNames('card', styles.card)}>
                <div className={classNames('d-flex mb-3', styles.code)}>
                  <span>$</span>
                  <p className={classNames('flex-fill mx-1 mb-0 fw-bold', styles.command)}>
                    lotus-miner actor propose-change-beneficiary --really-do-it &lt;contractAddress&gt; &lt;quota&gt; &lt;expiration&gt;
                    <br />
                    quota: 10000000
                    <br />
                    expiration: block.number + 1080 * 24 * 3600 / 30
                  </p>
                  <a href="#">
                    <IconCopy />
                  </a>
                </div>
                <div className={classNames('d-flex', styles.code)}>
                  <span>$</span>
                  <p className={classNames('flex-fill mx-1 mb-0 fw-bold', styles.command)}>
                    lotus-miner actor set-owner --really-do-it &lt;contractAddress&gt; &lt;ownerAddress&gt;
                  </p>
                  <a href="#">
                    <IconCopy />
                  </a>
                </div>
              </div>

              <div className="p-5">
                <SpinBtn className="btn btn-primary w-100" disabled={disabled} loading={submitting} onClick={handleSubmit}>
                  {isSigned ? '已确认' : submitting ? '正在确认' : '信息无误且已完成操作，确认'}
                </SpinBtn>
              </div>
            </div>
          </>
        )}
      </Skeleton>
    </div>
  );
}
