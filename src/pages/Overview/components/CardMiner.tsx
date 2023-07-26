import { Input } from 'antd';
import { useMemo } from 'react';

import Dialog from '@/components/Dialog';
import SpinBtn from '@/components/SpinBtn';
import { formatAmount } from '@/utils/format';
import useContract from '@/hooks/useContract';
import useRaiseBase from '@/hooks/useRaiseBase';
import useRaiseRole from '@/hooks/useRaiseRole';
import useRaiseMiner from '@/hooks/useRaiseMiner';
import useRaiseState from '@/hooks/useRaiseState';
import useProcessify from '@/hooks/useProcessify';
import { accAdd, accSub, sleep } from '@/utils/utils';

const CardMiner: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { startPreSeal } = useContract(data?.raise_address);

  const { isRaiser } = useRaiseRole(data);
  const { actual, minTarget, refetch } = useRaiseBase(data);
  const { funds, pledge, safe, sealed } = useRaiseMiner(data);
  const { isStarted, isSuccess, isWorking } = useRaiseState(data);

  // 可转入 = 总质押 + 运维保证金 + 缓冲金 - 已封装
  const amount = useMemo(() => accSub(accAdd(pledge, funds, safe), sealed), [funds, pledge, safe, sealed]);

  const [sealing, sealAction] = useProcessify(async () => {
    if (!data) return;

    await startPreSeal(data.raising_id);

    await sleep(2e3);

    refetch();
  });

  const handleSeal = () => {
    const hide = Dialog.confirm({
      icon: 'transfer',
      title: `${formatAmount(amount, 2, 2)}FIL 转入Miner地址`,
      summary: '将集合质押(在Owner地址)的余额转入Miner地址，用于封装扇区。集合质押到期时，最后余额自动转入。',
      confirmBtnVariant: 'danger',
      onConfirm: () => {
        hide();

        sealAction();
      },
    });
  };

  if (isRaiser && (isStarted || isSuccess) && !isWorking && actual >= minTarget && amount > 0) {
    return (
      <>
        <div className="card section-card">
          <div className="card-body ffi-form">
            <p className="mb-2 text-main">质押余额(Owner地址)</p>
            <div className="ffi-item mb-3 fs-16 text-end">
              <Input readOnly size="large" suffix="FIL" value={formatAmount(amount, 2, 2)} />
            </div>

            <div className="mb-3">
              <SpinBtn className="btn btn-primary btn-lg w-100" disabled={amount <= 0} loading={sealing} onClick={handleSeal}>
                转入Miner地址
              </SpinBtn>
            </div>

            <p className="mb-0">集合质押达到成立条件，主办人可将质押转入Miner地址，边募集边封装。集合质押到期时，余额自动转入。</p>
          </div>
        </div>
      </>
    );
  }

  return null;
};

export default CardMiner;
