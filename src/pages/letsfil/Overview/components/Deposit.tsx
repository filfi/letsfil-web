import { ethers } from 'ethers';
import ClipboardJS from 'clipboard';
import { useModel } from '@umijs/max';
import { useMemoizedFn } from 'ahooks';
import { useMemo, useRef } from 'react';

import Modal from '@/components/Modal';
import { isEqual } from '@/utils/utils';
import { EventType } from '@/utils/mitt';
import SpinBtn from '@/components/SpinBtn';
import useProcessify from '@/hooks/useProcessify';
import PayforModal from '@/components/PayforModal';
import useEmittHandler from '@/hooks/useEmitHandler';
import usePlanContract from '@/hooks/usePlanContract';

const Deposit: React.FC<{ data?: API.Plan }> = ({ data }) => {
  const modal = useRef<ModalAttrs>(null);
  const { initialState } = useModel('@@initialState');
  const contract = usePlanContract(data?.raise_address);
  const raiseId = useMemo(() => data?.raising_id, [data]);

  const onChangeOpsPayer = useMemoizedFn(async (res: API.Base) => {
    console.log('[onChangeOpsPayer]: ', res);

    const raiseID = res.raiseID.toString();

    if (isEqual(raiseID, raiseId)) {
      const url = `${location.origin}/letsfil/payfor/overview/${raiseID}`;

      const content = ClipboardJS.copy(url);

      if (content) {
        Modal.alert({ content, icon: 'success', title: '链接已复制' });
      }
    }
  });

  useEmittHandler({
    [EventType.onChangeOpsPayer]: onChangeOpsPayer,
  });

  // 支付运维保证金
  const [paying, handlePay] = useProcessify(async () => {
    if (!data || !data.ops_security_fund) return;

    await contract.depositOPSFund({
      value: ethers.BigNumber.from(`${data.ops_security_fund}`),
    });
  });

  // 好友代付，修改支付地址
  const [payforing, handlePayfor] = useProcessify(async (address: string) => {
    await contract.changeOpsPayer(address);
  });

  return (
    <>
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">未缴纳运维保证金</h5>
          <p>运维保证金根据节点大小与节点封装延期产生的罚金来计算，节点到期时返还；选择自己支付则自己获取收益，他人支付则他人获取收益</p>

          <div className="row row-cols-1 row-cols-xl-2 g-3">
            <div className="col">
              <SpinBtn className="btn btn-light btn-lg w-100" loading={paying} disabled={initialState?.processing || payforing} onClick={handlePay}>
                {paying ? '正在支付' : '自己支付'}
              </SpinBtn>
            </div>
            <div className="col">
              <SpinBtn
                className="btn btn-primary btn-lg w-100"
                loading={payforing}
                disabled={initialState?.processing || paying}
                onClick={() => modal.current?.show()}
              >
                {payforing ? '正在处理' : '他人代付'}
              </SpinBtn>
            </div>
          </div>
        </div>
      </div>

      <PayforModal ref={modal} loading={payforing} onConfirm={handlePayfor} />
    </>
  );
};

export default Deposit;
