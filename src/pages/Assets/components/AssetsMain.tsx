import { useMemo } from 'react';

import { isMountPlan } from '@/helpers/mount';
import useAssetPack from '@/hooks/useAssetPack';
import useMountAssets from '@/hooks/useMountAssets';
import { formatAmount, formatPower } from '@/utils/format';

const RaiseAssets: React.FC<{
  pack?: API.Pack | null;
  plan?: API.Plan | null;
  role: number;
}> = ({ pack, plan, role }) => {
  const { investorAmount, investorPower, opsSealed, opsPower, raiserPower, servicerPower } = useAssetPack(plan, pack);

  const pledge = useMemo(() => [investorAmount, 0, 0, opsSealed][role] ?? 0, [role, investorAmount, opsSealed]);
  const power = useMemo(() => [investorPower, raiserPower, servicerPower, opsPower][role] ?? 0, [role, investorPower, raiserPower, servicerPower, opsPower]);

  return (
    <>
      <div className="card mb-3">
        <div className="card-body">
          <p className="mb-1 text-gray fw-500">我的算力</p>
          <p className="mb-0 fw-600">
            <span className="fs-24">{formatPower(power)?.[0]}</span>
            <span className="ms-1 fs-sm fw-bold text-neutral">{formatPower(power)?.[1]}</span>
          </p>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body d-flex gap-3">
          <div>
            <p className="mb-1 text-gray fw-500">我的质押</p>
            <p className="mb-0 fw-600">
              <span className="fs-24">{formatAmount(pledge)}</span>
              <span className="ms-1 fs-sm fw-bold text-neutral">FIL</span>
            </p>
          </div>

          {/* {isDestroyed && isInvestor && (
            <div className="ms-auto my-auto">
              <SpinBtn className="btn btn-primary btn-lg px-5" loading={unstaking} disabled={pledge <= 0 || withdrawing} onClick={unStaking}>
                取回
              </SpinBtn>
            </div>
          )} */}
        </div>
      </div>
    </>
  );
};

const MountAssets: React.FC<{
  plan?: API.Plan | null;
  role: number;
}> = ({ plan, role }) => {
  const { investorPledge, investorPower, sponsorPower, servicerPower } = useMountAssets(plan);

  const power = useMemo(() => [investorPower, sponsorPower, servicerPower, 0][role] ?? 0, [role, investorPower, sponsorPower, servicerPower]);
  const pledge = useMemo(() => [investorPledge, 0, 0, 0][role] ?? 0, [role, investorPledge]);

  return (
    <>
      <div className="card mb-3">
        <div className="card-body">
          <p className="mb-1 text-gray fw-500">我的算力</p>
          <p className="mb-0 fw-600">
            <span className="fs-24">{formatPower(power)?.[0]}</span>
            <span className="ms-1 fs-sm fw-bold text-neutral">{formatPower(power)?.[1]}</span>
          </p>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body d-flex gap-3">
          <div>
            <p className="mb-1 text-gray fw-500">我的质押</p>
            <p className="mb-0 fw-600">
              <span className="fs-24">{formatAmount(pledge)}</span>
              <span className="ms-1 fs-sm fw-bold text-neutral">FIL</span>
            </p>
          </div>

          {/* {isDestroyed && isInvestor && (
            <div className="ms-auto my-auto">
              <SpinBtn className="btn btn-primary btn-lg px-5" loading={unstaking} disabled={pledge <= 0 || withdrawing} onClick={unStaking}>
                取回
              </SpinBtn>
            </div>
          )} */}
        </div>
      </div>
    </>
  );
};

const AssetsMain: React.FC<{
  pack?: API.Pack | null;
  plan?: API.Plan | null;
  role: number;
}> = ({ pack, plan, role }) => {
  if (isMountPlan(plan)) {
    return <MountAssets plan={plan} role={role} />;
  }

  return <RaiseAssets pack={pack} plan={plan} role={role} />;
};

export default AssetsMain;
