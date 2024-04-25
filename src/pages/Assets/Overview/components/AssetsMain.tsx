import { useMemo } from 'react';
import { useModel } from '@umijs/max';

import { isMountPlan } from '@/helpers/mount';
import { accMul, accSub } from '@/utils/utils';
import useMountAssets from '@/hooks/useMountAssets';
import { formatAmount, formatPower } from '@/utils/format';

const RaiseAssets: React.FC<{ role: number }> = ({ role }) => {
  const { assets, release } = useModel('assets.assets');
  const { released: releasedTotal, total: totalPledge } = release;
  const {
    backAmount,
    investorAmount,
    opsSealed,
    opsPower,
    raiserPower,
    servicerPower,
    pledgePower,
    collateralPower,
    user: { sealedCollateral },
  } = assets;

  const investorReleased = useMemo(() => backAmount, [backAmount]);
  // 运维保证金已释放 = max(总释放 - 总质押, 0)
  const opsReleased = useMemo(() => Math.max(accSub(releasedTotal, totalPledge), 0), [releasedTotal, totalPledge]);
  const investorPledge = useMemo(
    () => Math.max(accSub(investorAmount, investorReleased), 0),
    [investorAmount, investorReleased],
  );

  const pledge = useMemo(() => [investorPledge, 0, 0, opsSealed][role], [role, investorPledge, opsSealed]);
  const released = useMemo(() => [investorReleased, 0, 0, opsReleased][role], [role, investorReleased, opsReleased]);
  const power = useMemo(
    () => [pledgePower, raiserPower, servicerPower, opsPower][role],
    [role, pledgePower, raiserPower, servicerPower, opsPower],
  );

  return (
    <>
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3 g-xl-5">
            <div className="col-12 col-sm-6 col-md-5">
              <p className="mb-1 text-gray fw-500">我的算力</p>
              <p className="mb-0 fw-600">
                <span className="fs-24">{formatPower(power)?.[0]}</span>
                <span className="ms-1 fs-sm fw-bold text-neutral">{formatPower(power)?.[1]}</span>
              </p>
            </div>

            {role === 0 && (
              <div className="col-12 col-sm-6 col-md-7">
                <p className="mb-1 text-gray fw-500">已抵押</p>
                <p className="mb-0 fw-600">
                  <span className="fs-24">{formatPower(collateralPower)?.[0]}</span>
                  <span className="ms-1 fs-sm fw-bold text-neutral">{formatPower(collateralPower)?.[1]}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3 g-xl-5">
            <div className="col-12 col-sm-6 col-md-5">
              <p className="mb-1 text-gray fw-500">
                <span>扇區質押</span>
                <span className="mx-2">/</span>
                <span>已釋放餘額</span>
              </p>
              <p className="mb-0 fw-600">
                <span className="fs-24">{formatAmount(pledge)}</span>
                <span className="ms-1 fs-sm fw-bold text-neutral">FIL</span>
                <span className="mx-2 fs-24 fw-light opacity-50">/</span>
                <span className="fs-24">{formatAmount(released)}</span>
                <span className="ms-1 fs-sm fw-bold text-neutral">FIL</span>
              </p>
            </div>

            {role === 0 && (
              <div className="col-12 col-sm-6 col-md-7">
                <p className="mb-1 text-gray fw-500">已抵押</p>
                <p className="mb-0 fw-600">
                  <span className="fs-24">{formatAmount(sealedCollateral)}</span>
                  <span className="ms-1 fs-sm fw-bold text-neutral">FIL</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const MountAssets: React.FC<{ role: number }> = ({ role }) => {
  const { assets, plan } = useModel('assets.assets');
  const { investorAmount, backAmount, user } = assets;
  const { sealedCollateral, collateralRate, pledgeRate } = user;
  const { sponsorPower, servicerPower, power: sealedPower } = useMountAssets(plan);

  const investorReleased = useMemo(() => backAmount, [backAmount]);
  const investorPledge = useMemo(
    () => Math.max(accSub(investorAmount, investorReleased), 0),
    [investorAmount, investorReleased],
  );

  const pledgePower = useMemo(() => accMul(sealedPower, pledgeRate), [pledgeRate, sealedPower]);
  const collateralPower = useMemo(() => accMul(sealedPower, collateralRate), [collateralRate, sealedPower]);

  const pledge = useMemo(() => [investorPledge, 0, 0][role], [role, investorPledge]);
  const released = useMemo(() => [investorReleased, 0, 0][role], [role, investorReleased]);
  const power = useMemo(
    () => [pledgePower, sponsorPower, servicerPower][role],
    [role, pledgePower, sponsorPower, servicerPower],
  );

  return (
    <>
      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3 g-xl-5">
            <div className="col-12 col-sm-6 col-md-5">
              <p className="mb-1 text-gray fw-500">我的算力</p>
              <p className="mb-0 fw-600">
                <span className="fs-24">{formatPower(power)?.[0]}</span>
                <span className="ms-1 fs-sm fw-bold text-neutral">{formatPower(power)?.[1]}</span>
              </p>
            </div>

            {role === 0 && (
              <div className="col-12 col-sm-6 col-md-7">
                <p className="mb-1 text-gray fw-500">已抵押</p>
                <p className="mb-0 fw-600">
                  <span className="fs-24">{formatPower(collateralPower)?.[0]}</span>
                  <span className="ms-1 fs-sm fw-bold text-neutral">{formatPower(collateralPower)?.[1]}</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="card mb-3">
        <div className="card-body">
          <div className="row g-3 g-xl-5">
            <div className="col-12 col-sm-6 col-md-5">
              <p className="mb-1 text-gray fw-500">
                <span>扇區質押</span>
                <span className="mx-1">/</span>
                <span>已釋放餘額</span>
              </p>
              <p className="mb-0 fw-600">
                <span className="fs-24">{formatAmount(pledge)}</span>
                <span className="ms-1 fs-sm fw-bold text-neutral">FIL</span>
                <span className="mx-2">/</span>
                <span className="fs-24">{formatAmount(released)}</span>
                <span className="ms-1 fs-sm fw-bold text-neutral">FIL</span>
              </p>
            </div>

            {role === 0 && (
              <div className="col-12 col-sm-6 col-md-7">
                <p className="mb-1 text-gray fw-500">已抵押</p>
                <p className="mb-0 fw-600">
                  <span className="fs-24">{formatAmount(sealedCollateral)}</span>
                  <span className="ms-1 fs-sm fw-bold text-neutral">FIL</span>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

const AssetsMain: React.FC<{ role: number }> = ({ role }) => {
  const { plan } = useModel('assets.assets');

  if (isMountPlan(plan)) {
    return <MountAssets role={role} />;
  }

  return <RaiseAssets role={role} />;
};

export default AssetsMain;
