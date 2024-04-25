import { Input } from 'antd';
import { useMemo } from 'react';
import { useRequest } from 'ahooks';
import { useModel } from '@umijs/max';

import { accAdd } from '@/utils/utils';
import { getExtInfo } from '@/apis/packs';
import SpinBtn from '@/components/SpinBtn';
import useAccount from '@/hooks/useAccount';
import { isMountPlan } from '@/helpers/mount';
import useRewardOps from '@/hooks/useRewardOps';
import useLoadingify from '@/hooks/useLoadingify';
import { formatAmount, toNumber } from '@/utils/format';
import useRewardSponsor from '@/hooks/useRewardSponsor';
import useRewardInvestor from '@/hooks/useRewardInvestor';
import useRewardServicer from '@/hooks/useRewardServicer';
import { ReactComponent as IconFil } from '@/assets/icons/filecoin.svg';

const RewardContent: React.FC<{
  pending: number;
  record: number;
  reward: number;
  loading?: boolean;
  onWithdraw?: () => void;
}> = ({ loading, pending, record, reward, onWithdraw }) => {
  return (
    <>
      <div className="card mb-3 border-0 bg-warning-tertiary">
        <div className="card-body d-flex flex-column flex-md-row gap-3">
          <div className="d-flex gap-3 me-auto">
            <IconFil width={48} height={48} />

            <h4 className="my-auto">
              <span className="fs-36 fw-600">{formatAmount(reward, 18)}</span>
              <span className="ms-1 fs-18 fw-bold text-gray">FIL</span>
            </h4>
          </div>

          <SpinBtn
            className="btn btn-primary btn-lg my-auto px-5"
            loading={loading}
            disabled={reward <= 0}
            onClick={onWithdraw}
          >
            擷取
          </SpinBtn>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <div className="row row-cols-1 row-cols-lg-2 g-3">
            {/* <div className="col">
              <div className="ffi-form">
                <p className="mb-1 fw-500">線性待釋放</p>
                <Input className="bg-light text-end" readOnly size="large" suffix="FIL" value={F.formatAmount(pending)} />
              </div>
            </div> */}
            <div className="col">
              <div className="ffi-form">
                <p className="mb-1 fw-500">鎖定激勵</p>
                <Input
                  className="bg-light text-end"
                  readOnly
                  size="large"
                  suffix="FIL"
                  value={formatAmount(pending, 2)}
                />
              </div>
            </div>
            <div className="col">
              <div className="ffi-form">
                <p className="mb-1 fw-500">已擷取(累計)</p>
                <Input
                  className="bg-light text-end"
                  readOnly
                  size="large"
                  suffix="FIL"
                  value={formatAmount(record, 2, 2)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const RaiseReward: React.FC<{ role: number }> = ({ role }) => {
  const { address } = useAccount();
  const { plan, state, refetch } = useModel('assets.assets');

  const { isDestroyed } = state;
  const ops = useRewardOps(plan); // 运维保证金的节点激励
  const sponsor = useRewardSponsor(plan); // 主办人的节点激励
  const investor = useRewardInvestor(plan); // 建设者的节点激励
  const servicer = useRewardServicer(plan); // 服务商的节点激励

  const getReword = async () => {
    if (address && plan?.raising_id) {
      const res = await getExtInfo(plan?.raising_id, address);

      return toNumber(res.got_investor_reward);
    }
  };

  const { data: investorRecord } = useRequest(getReword, { refreshDeps: [address, plan?.raising_id] });

  const investorBack = useMemo(
    () => accAdd(investor.backAmount, investor.backInterest),
    [investor.backAmount, investor.backInterest],
  );
  const investorReward = useMemo(() => accAdd(investor.reward, investorBack), [investor.reward, investorBack]);

  const reward = useMemo(
    () => [investorReward, sponsor.reward, servicer.reward, isDestroyed ? ops.pending : 0][role] ?? 0,
    [role, investorReward, sponsor.reward, servicer.reward, ops.pending, isDestroyed],
  );
  const record = useMemo(
    () => [/* investor.record */ investorRecord, sponsor.record, servicer.record, ops.fundReward][role] ?? 0,
    [role, /* investor.record, */ investorRecord, sponsor.record, servicer.record, ops.fundReward],
  );
  const pending = useMemo(
    () => [investor.pending, sponsor.pending, servicer.pending, isDestroyed ? 0 : ops.pending][role] ?? 0,
    [role, investor.pending, sponsor.pending, servicer.pending, ops.pending, isDestroyed],
  );

  const [withdrawing, handleWithdraw] = useLoadingify(async () => {
    if (role === 0) {
      await investor.withdrawAction();
    } else if (role === 1) {
      await sponsor.withdrawAction();
    } else if (role === 2) {
      await servicer.withdrawAction();
    } else if (role === 3) {
      await ops.withdrawRewardAction();
    }

    refetch();
  });

  return (
    <RewardContent
      loading={withdrawing}
      pending={pending}
      record={record}
      reward={reward}
      onWithdraw={handleWithdraw}
    />
  );
};

const MountReward: React.FC<{ role: number }> = ({ role }) => {
  const { address } = useAccount();
  const { plan, refetch } = useModel('assets.assets');

  const sponsor = useRewardSponsor(plan); // 主办人的节点激励
  const investor = useRewardInvestor(plan); // 建设者的节点激励
  const servicer = useRewardServicer(plan); // 服务商的节点激励

  const getReword = async () => {
    if (address && plan?.raising_id) {
      const res = await getExtInfo(plan?.raising_id, address);

      return toNumber(res.got_investor_reward);
    }
  };

  const { data: investorRecord } = useRequest(getReword, { refreshDeps: [address, plan?.raising_id] });

  const investorBack = useMemo(
    () => accAdd(investor.backAmount, investor.backInterest),
    [investor.backAmount, investor.backInterest],
  );
  const investorReward = useMemo(() => accAdd(investor.reward, investorBack), [investor.reward, investorBack]);

  const reward = useMemo(
    () => [investorReward, sponsor.reward, servicer.reward][role] ?? 0,
    [role, investorReward, sponsor.reward, servicer.reward],
  );
  const record = useMemo(
    () => [/* investor.record */ investorRecord, sponsor.record, servicer.record][role] ?? 0,
    [role, /* investor.record, */ investorRecord, sponsor.record, servicer.record],
  );
  const pending = useMemo(
    () => [investor.pending, sponsor.pending, servicer.pending][role] ?? 0,
    [role, investor.pending, sponsor.pending, servicer.pending],
  );

  const [withdrawing, handleWithdraw] = useLoadingify(async () => {
    if (role === 0) {
      await investor.withdrawAction();
    } else if (role === 1) {
      await sponsor.withdrawAction();
    } else if (role === 2) {
      await servicer.withdrawAction();
    }

    refetch();
  });

  return (
    <RewardContent
      loading={withdrawing}
      pending={pending}
      record={record}
      reward={reward}
      onWithdraw={handleWithdraw}
    />
  );
};

const AssetsReward: React.FC<{ role: number }> = ({ role }) => {
  const { plan } = useModel('assets.assets');

  if (isMountPlan(plan)) {
    return <MountReward role={role} />;
  }

  return <RaiseReward role={role} />;
};

export default AssetsReward;
