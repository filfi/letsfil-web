import { Input } from 'antd';
import { useMemo } from 'react';

import SpinBtn from '@/components/SpinBtn';
import { formatAmount } from '@/utils/format';
import useRewardOps from '@/hooks/useRewardOps';
import useLoadingify from '@/hooks/useLoadingify';
import useRewardSponsor from '@/hooks/useRewardSponsor';
import useRewardInvestor from '@/hooks/useRewardInvestor';
import useRewardServicer from '@/hooks/useRewardServicer';
import { ReactComponent as IconFil } from '@/assets/icons/filecoin.svg';

const AssetsReward: React.FC<{
  plan?: API.Plan | null;
  role: number;
  refetch?: () => void;
}> = ({ plan, role, refetch }) => {
  const ops = useRewardOps(plan); // 运维保证金的节点激励
  const sponsor = useRewardSponsor(plan); // 主办人的节点激励
  const investor = useRewardInvestor(plan); // 建设者的节点激励
  const servicer = useRewardServicer(plan); // 服务商的节点激励

  const reward = useMemo(() => [investor.reward, sponsor.reward, servicer.reward, 0][role] ?? 0, [role, investor.reward, sponsor.reward, servicer.reward]);
  const record = useMemo(() => [investor.record, sponsor.record, servicer.record, 0][role] ?? 0, [role, investor.record, sponsor.record, servicer.record]);
  const pending = useMemo(
    () => [investor.pending, sponsor.pending, servicer.pending, ops.pending][role] ?? 0,
    [role, investor.pending, sponsor.pending, servicer.pending, ops.pending],
  );

  const [withdrawing, handleWithdraw] = useLoadingify(async () => {
    if (role === 0) {
      await investor.withdrawAction();
    } else if (role === 1) {
      await sponsor.withdrawAction();
    } else if (role === 2) {
      await servicer.withdrawAction();
    }

    refetch?.();
  });

  return (
    <>
      <div className="card mb-3 border-0 bg-warning-tertiary">
        <div className="card-body d-flex flex-column flex-md-row gap-3">
          <div className="d-flex gap-3 me-auto">
            <IconFil width={48} height={48} />

            <h4 className="my-auto">
              <span className="fs-36 fw-600">{formatAmount(reward)}</span>
              <span className="ms-1 fs-18 fw-bold text-gray">FIL</span>
            </h4>
          </div>

          <SpinBtn className="btn btn-primary btn-lg my-auto px-5" loading={withdrawing} disabled={reward <= 0} onClick={handleWithdraw}>
            提取
          </SpinBtn>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <div className="row row-cols-1 row-cols-lg-2 g-3">
            {/* <div className="col">
              <div className="ffi-form">
                <p className="mb-1 fw-500">线性待释放</p>
                <Input className="bg-light text-end" readOnly size="large" suffix="FIL" value={F.formatAmount(pending)} />
              </div>
            </div> */}
            <div className="col">
              <div className="ffi-form">
                <p className="mb-1 fw-500">锁定激励</p>
                <Input className="bg-light text-end" readOnly size="large" suffix="FIL" value={formatAmount(pending, 2)} />
              </div>
            </div>
            <div className="col">
              <div className="ffi-form">
                <p className="mb-1 fw-500">已提取(累计)</p>
                <Input className="bg-light text-end" readOnly size="large" suffix="FIL" value={formatAmount(record, 2, 2)} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AssetsReward;
