import { ethers } from 'ethers';
import ClipboardJS from 'clipboard';
import { history, useModel } from '@umijs/max';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMemoizedFn, useMount, useRequest, useSessionStorageState, useUnmount } from 'ahooks';

import styles from './styles.less';
import * as H from '@/helpers/app';
import * as U from '@/utils/utils';
import Modal from '@/components/Modal';
import { getInfo } from '@/apis/raise';
import { EventType } from '@/utils/mitt';
import SpinBtn from '@/components/SpinBtn';
import ShareBtn from '@/components/ShareBtn';
import { normalizeKey } from '@/utils/storage';
import { RaiseState } from '@/constants/state';
import usePlanState from '@/hooks/usePlanState';
import useProcessify from '@/hooks/useProcessify';
import PayforModal from '@/components/PayforModal';
import useEmittHandler from '@/hooks/useEmitHandler';
import useRaiseContract from '@/hooks/useRaiseContract';
import { formatAmount, toNumber } from '@/utils/format';

export default function CreatePayment() {
  const modal = useRef<ModalAttrs>(null);
  const [data, setData] = useModel('stepform');
  const [address, setAddress] = useState<string | undefined>(data?.raisePool);

  const [amount, setAmount] = useSessionStorageState(normalizeKey('deposit'), {
    defaultValue: data?.securityFund,
  });
  const [raiseId, setRaiseId] = useSessionStorageState(normalizeKey('raiseID'), {
    defaultValue: data?.raiseID,
  });

  const raise = useRaiseContract();
  const { contract, planState, setPlanState } = usePlanState(address);

  const isRaisePaied = useMemo(() => planState > RaiseState.NotStarted, [planState]);
  const isPlanPaied = useMemo(() => planState > RaiseState.WaitPayOPSSecurityFund, [planState]);

  const service = async () => {
    if (raiseId) {
      return await getInfo(raiseId);
    }

    return undefined;
  };

  const { data: detail, refresh } = useRequest(service, { refreshDeps: [raiseId] });

  const onDetailChange = useMemoizedFn(() => {
    if (detail?.raise_address) {
      setAddress(detail?.raise_address);
    }

    if (detail?.security_fund && !amount) {
      setAmount(`${toNumber(detail.security_fund)}`);
    }
  });

  useEffect(onDetailChange, [detail]);

  const onCreatePlan = useMemoizedFn((res: API.Base) => {
    console.log('[onCreatePlan]: ', res);

    const raisePool = res.raisePool;
    const raiseID = res.raiseID.toString();

    // 当前账户创建
    if (U.isEqual(raiseID, raiseId)) {
      setAddress(raisePool);
      setData(undefined);
      refresh();

      // getRaiseState();
      // 创建成功，等待支付运维保证金
      setPlanState(RaiseState.WaitPayOPSSecurityFund);
    }
  });

  const onChangeOpsPayer = useMemoizedFn(async (res: API.Base) => {
    console.log('[onChangeOpsPayer]: ', res);

    const raiseID = res.raiseID.toString();

    if (U.isEqual(raiseID, raiseId)) {
      const url = `${location.origin}/letsfil/payfor/overview/${raiseId}`;

      const content = ClipboardJS.copy(url);

      if (content) {
        Modal.alert({ content, icon: 'success', title: '链接已复制' });
      }
    }
  });

  const onDepositOPSFund = useMemoizedFn((res: API.Base) => {
    console.log('[onDepositOPSFund]: ', res);

    const raiseID = res.raiseID.toString();

    if (U.isEqual(raiseID, raiseId)) {
      setPlanState(RaiseState.WaitSeverSign);
    }
  });

  const onStartRaisePlan = useMemoizedFn((res: API.Base) => {
    console.log('[onStartRaisePlan]: ', res);

    const raiseID = res.raiseID.toString();

    if (U.isEqual(raiseID, raiseId)) {
      setData(undefined);

      history.push(`/letsfil/overview/${raiseID}`);
    }
  });

  useEmittHandler({
    [EventType.onCreateRaisePlan]: onCreatePlan,
    [EventType.onChangeOpsPayer]: onChangeOpsPayer,
    [EventType.onDepositOPSFund]: onDepositOPSFund,
    [EventType.onStartRaisePlan]: onStartRaisePlan,
  });

  useMount(() => {
    if (data?.raisePool && !address) {
      setAddress(data.raisePool);
    }

    if (data?.raiseID && !raiseId) {
      setRaiseId(data.raiseID);
    }

    if (data?.securityFund && !amount) {
      setAmount(data.securityFund);
    }
  });

  useUnmount(() => {
    setAmount(undefined);
    setRaiseId(undefined);
  });

  // 创建募集计划并支付募集保证金
  const [raiseLoading, handleRaisePay] = useProcessify(async () => {
    if (!data) return;

    // 募集计划信息
    const raiseInfo = H.transformRaiseInfo(data);
    // 节点信息
    const nodeInfo = H.transformNodeInfo(data);
    // 拓展信息
    const extraInfo = H.transformExtraInfo(data);

    setRaiseId(raiseInfo.id.toString());

    await raise.createRaisePlan(raiseInfo, nodeInfo, extraInfo, {
      value: ethers.utils.parseEther(`${amount}`),
    });
  });

  // 支付运维保证金
  const [opsLoading, handleOpsFund] = useProcessify(async () => {
    await contract.depositOPSFund({
      value: ethers.utils.parseEther(`${amount}`),
    });
  });

  // 确认发起代付
  const [payforLoading, handlePayfor] = useProcessify(async (address: string) => {
    await contract.changeOpsPayer(address);
  });

  return (
    <>
      <div className={styles.item}>
        <h5 className="letsfil-label">募集保证金</h5>
        <p className={styles.input}>{formatAmount(amount)} FIL</p>
        <p className={styles.help}>募集保证金为募集目标的5%，从当前登录钱包地址中进行扣除，节点开始封装时返还</p>

        {isRaisePaied ? (
          <button type="button" disabled className="btn btn-light btn-lg w-100">
            已支付
          </button>
        ) : (
          <SpinBtn className="btn btn-primary btn-lg w-100" loading={raiseLoading} onClick={handleRaisePay}>
            {raiseLoading ? '正在支付' : '自己支付'}
          </SpinBtn>
        )}
      </div>

      <div className={styles.item}>
        <h5 className="letsfil-label">运维保证金</h5>
        <p className={styles.input}>{formatAmount(amount)} FIL</p>
        <p className={styles.help}>运维保证金根据节点大小与节点封装延期产生的罚金来计算，节点到期时返还；选择自己支付则自己获取收益，他人支付则他人获取收益</p>

        {isPlanPaied ? (
          <button type="button" disabled className="btn btn-light btn-lg w-100">
            已支付
          </button>
        ) : (
          <div className="row row-cols-2">
            <div className="col">
              <SpinBtn loading={opsLoading} className="btn btn-light btn-lg w-100" disabled={payforLoading || !isRaisePaied} onClick={handleOpsFund}>
                {opsLoading ? '正在支付' : '自己支付'}
              </SpinBtn>
            </div>
            <div className="col">
              <SpinBtn
                loading={payforLoading}
                disabled={opsLoading || !isRaisePaied}
                className="btn btn-primary btn-lg w-100"
                onClick={() => modal.current?.show()}
              >
                {payforLoading ? '正在处理' : '他人代付'}
              </SpinBtn>
            </div>
          </div>
        )}
      </div>

      <div className={styles.item}>
        <h5 className="letsfil-label mb-2">服务商签名</h5>
        <p className={styles.help}>服务商将核对分配比例和节点信息，无误即可签名核准</p>

        <ShareBtn
          className="btn btn-primary btn-lg w-100"
          disabled={!isRaisePaied || !isPlanPaied}
          text={`${location.origin}/letsfil/confirm/overview/${raiseId}`}
        >
          分享计划给服务商
        </ShareBtn>
      </div>

      <PayforModal ref={modal} loading={payforLoading} onConfirm={handlePayfor} />
    </>
  );
}
