import dayjs from 'dayjs';
import { ethers } from 'ethers';
import { Form, Input } from 'antd';
import { history, useModel } from '@umijs/max';
import { useMemoizedFn, useMount } from 'ahooks';
import { useMemo, useRef, useState } from 'react';

import * as U from '@/utils/utils';
import styles from './styles.less';
import Modal from '@/components/Modal';
import toastify from '@/utils/toastify';
import { EventType } from '@/utils/mitt';
import SpinBtn from '@/components/SpinBtn';
import { RaiseState } from '@/constants/state';
import useLoadingify from '@/hooks/useLoadingify';
import useEmittHandler from '@/hooks/useEmitHandler';
import usePlanContract from '@/hooks/usePlanContract';
import useRaiseContract from '@/hooks/useRaiseContract';

export default function CreatePayment() {
  const modal = useRef<ModalAttrs>(null);
  const [data, setData] = useModel('stepform');
  const address = useRef<string | undefined>(data?.raisePool);

  const [form] = Form.useForm();
  const raise = useRaiseContract();
  const plan = usePlanContract(address);
  const [raiseState, setRaiseState] = useState(-1);

  const isRaisePaied = useMemo(() => raiseState > RaiseState.NotStarted, [raiseState]);
  const isPlanPaied = useMemo(() => raiseState > RaiseState.WaitPayOPSSecurityFund, [raiseState]);

  // 创建募集计划并支付募集保证金
  const handleRaisePay = async () => {
    if (!data) return;

    await toastify(async () => {
      // 创建交易
      return await U.withTx(
        raise.createRaisePlan(
          {
            // 募集计划信息
            id: 0,
            targetAmount: ethers.utils.parseEther(`${data.targetAmount}`),
            securityFund: ethers.utils.parseEther(`${data.securityFund}`),
            securityFundRate: data.securityFundRate * 100,
            deadline: dayjs(data.deadline).unix(),
            raiserShare: +data.raiserShare,
            investorShare: +data.investorShare,
            servicerShare: +data.servicerShare,
            sponsor: data.sponsor,
            raiseCompany: data.raiseCompany,
            spAddress: data.spAddress,
            companyId: data.companyId,
          },
          {
            // 节点信息
            minerID: +U.parseMinerID(data.minerID),
            nodeSize: `${U.pb2byte(data.nodeSize)}`,
            sectorSize: [32, 64][data.sectorSize],
            sealPeriod: U.day2sec(data.sealPeriod),
            nodePeriod: U.day2sec([90, 120, 180, 240, 360][data.nodePeriod]),
            opsSecurityFund: ethers.utils.parseEther(`${data.securityFund}`),
            opsSecurityFundPayer: data.sponsor,
            realSealAmount: 0,
          },
          {
            value: ethers.utils.parseEther(`${data.securityFund}`),
          },
        ),
      );
    })();
  };

  // 支付运维保证金
  const handlePoolPay = async () => {
    if (!data) return;

    await toastify(async () => {
      return U.withTx(
        plan.depositOPSFund({
          value: ethers.utils.parseEther(`${data.securityFund}`),
        }),
      );
    })();
  };

  // 确认发起代付
  const handleConfirm = async () => {
    try {
      await form.validateFields();
    } catch (e) {
      return false;
    }

    const vals = form.getFieldsValue();
    console.log(vals);

    await toastify(async () => {
      return U.withTx(plan.specifyOpsPayer(vals.address));
    })();
  };

  const { loading: poolLoading, run: depositOPSFund } = useLoadingify(handlePoolPay);
  const { loading: raiseLoading, run: createRaisePool } = useLoadingify(handleRaisePay);
  const { loading: confirmLoading, run: handlePayfor } = useLoadingify(handleConfirm);

  const getRaiseState = async () => {
    address.current = data?.raisePool;

    const raiseState = await plan.getRaiseState();

    console.log('[raiseID]: ', data?.raiseID);
    console.log('[raiseState]: ', raiseState);

    setRaiseState(raiseState ?? -1);
  };

  const onCreateRaise = useMemoizedFn((res: API.Base) => {
    console.log('[onCreateRaise]: ', res);

    const { raisePool, raiseInfo } = res;
    const raiseID = raiseInfo.id.toNumber();

    // 当前账户创建
    if (U.isEqual(raiseInfo.sponsor, data?.sponsor)) {
      address.current = raisePool;

      setData((d) => ({ ...d, raiseID, raisePool }));

      // getRaiseState();
      // 创建成功，等待支付运维保证金
      setRaiseState(RaiseState.WaitPayOPSSecurityFund);
    }
  });

  const onDepositOPSFund = useMemoizedFn((res: API.Base) => {
    console.log('[onDepositOPSFund]: ', res);

    const raiseID = res.raiseID.toNumber();

    if (U.isEqual(raiseID, data?.raiseID)) {
      setRaiseState(RaiseState.WaitSeverSign);
    }
  });

  const onStartPlan = useMemoizedFn((res: API.Base) => {
    console.log('[onStartPlan]: ', res);

    const raiseID = res.raiseID.toNumber();

    if (U.isEqual(raiseID, data?.raiseID)) {
      setData(undefined);

      history.push(`/letsfil/overview/${raiseID}`);
    }
  });

  useEmittHandler({
    [EventType.OnCreateRaise]: onCreateRaise,
    [EventType.OnStartRaisePlan]: onStartPlan,
    [EventType.OnDepositOPSFund]: onDepositOPSFund,
  });

  useMount(getRaiseState);

  return (
    <>
      <div className={styles.item}>
        <h5 className="letsfil-label">募集保证金</h5>
        <p className={styles.input}>{data?.securityFund} FIL</p>
        <p className={styles.help}>
          募集保证金为募集目标的{data?.securityFundRate}
          %，从当前登录钱包地址中进行扣除，节点开始封装时返还
        </p>

        {isRaisePaied ? (
          <button type="button" disabled className="btn btn-light btn-lg w-100">
            已支付
          </button>
        ) : (
          <SpinBtn className="btn btn-primary btn-lg w-100" loading={raiseLoading} onClick={createRaisePool}>
            {raiseLoading ? '正在支付' : '自己支付'}
          </SpinBtn>
        )}
      </div>

      <div className={styles.item}>
        <h5 className="letsfil-label">运维保证金</h5>
        <p className={styles.input}>{data?.securityFund} FIL</p>
        <p className={styles.help}>运维保证金根据节点大小与节点封装延期产生的罚金来计算，节点到期时返还；选择自己支付则自己获取收益，他人支付则他人获取收益</p>

        {isPlanPaied ? (
          <button type="button" disabled className="btn btn-light btn-lg w-100">
            已支付
          </button>
        ) : (
          <div className="row row-cols-2">
            <div className="col">
              <SpinBtn className="btn btn-light btn-lg w-100" loading={poolLoading} disabled={!isRaisePaied} onClick={depositOPSFund}>
                {poolLoading ? '正在支付' : '自己支付'}
              </SpinBtn>
            </div>
            <div className="col">
              <SpinBtn disabled={poolLoading || !isRaisePaied} className="btn btn-primary btn-lg w-100" onClick={() => modal.current?.show()}>
                他人代付
              </SpinBtn>
            </div>
          </div>
        )}
      </div>

      <div className={styles.item}>
        <h5 className="letsfil-label">服务商签名</h5>
        <p className={styles.help}>服务商将核对分配比例和节点信息，无误即可签名核准</p>

        <button type="button" disabled={!isRaisePaied || !isPlanPaied} className="btn btn-primary btn-lg w-100">
          分享计划给服务商
        </button>
      </div>

      <Modal ref={modal} title="填写支付地址" bodyClassName="pb-0" confirmLoading={confirmLoading} onConfirm={handlePayfor}>
        <p className="text-gray text-center">只有该地址对应的账户才能支付运维保证金</p>

        <Form layout="vertical" form={form}>
          <Form.Item name="address" label="钱包地址" rules={[{ required: true, message: '输入地址' }]}>
            <Input placeholder="输入地址" />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
