import { Input } from 'antd';
import { useMemo } from 'react';
import { useModel } from '@umijs/max';

import Dialog from '@/components/Dialog';
import SpinBtn from '@/components/SpinBtn';
import { formatAmount } from '@/utils/format';
import useContract from '@/hooks/useContract';
import useRaiseMiner from '@/hooks/useRaiseMiner';
import useProcessify from '@/hooks/useProcessify';
import { accAdd, accMul, accSub, sleep } from '@/utils/utils';

const CardMiner: React.FC = () => {
  const { base, plan, role, state } = useModel('Overview.overview');

  const { startPreSeal } = useContract(plan?.raise_address);

  const { isRaiser } = role;
  const { isStarted, isSuccess, isWorking } = state;
  const { actual, progress, minTarget, refetch } = base;
  const { funds, pledge, safe, sealed } = useRaiseMiner(plan);

  // 可转入 = 总质押 + 运维保证金 * 募集比例 + 缓冲金 - 已封装
  const amount = useMemo(
    () => accSub(accAdd(pledge, accMul(funds, progress), safe), sealed),
    [funds, pledge, progress, safe, sealed],
  );

  const [sealing, sealAction] = useProcessify(async () => {
    if (!plan) return;

    await startPreSeal(plan.raising_id);

    await sleep(2e3);

    refetch();
  });

  const handleSeal = () => {
    const hide = Dialog.confirm({
      icon: 'transfer',
      title: `${formatAmount(amount, 2, 2)}FIL 轉入Miner地址`,
      summary: '將集合質押(在Owner地址)的餘額轉入Miner地址，用於封裝扇區。集質押到期時，最後餘額自動轉入。',
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
        <div className="card section-card sticky-card">
          <div className="card-body ffi-form">
            <p className="mb-2 text-main">質押餘額(Owner地址)</p>
            <div className="ffi-item mb-3 fs-16 text-end">
              <Input readOnly size="large" suffix="FIL" value={formatAmount(amount, 2, 2)} />
            </div>

            <div className="mb-3">
              <SpinBtn
                className="btn btn-primary btn-lg w-100"
                disabled={amount <= 0}
                loading={sealing}
                onClick={handleSeal}
              >
                轉入Miner地址
              </SpinBtn>
            </div>

            <p className="mb-0">
              集合質押達到成立條件，主辦人可將質押轉入Miner地址，邊募集邊封裝。集質押到期時，餘額自動轉入。
            </p>
          </div>
        </div>
      </>
    );
  }

  return null;
};

export default CardMiner;
