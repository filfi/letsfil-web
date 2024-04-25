import { Input } from 'antd';
import { useMemo } from 'react';
import { Link, useModel } from '@umijs/max';

import SpinBtn from '@/components/SpinBtn';
import { accDiv, accMul } from '@/utils/utils';
import useProcessify from '@/hooks/useProcessify';
import LoadingView from '@/components/LoadingView';
import useFromAsset from '../../hooks/useFromAsset';
import useLoanAsset from '../../hooks/useLoanAsset';
import useEmittHandler from '@/hooks/useEmitHandler';
import useLoanContract from '@/hooks/useLoanContract';
import { formatAmount, formatID, formatPower } from '@/utils/format';
import { ReactComponent as IconFil } from '@/assets/icons/filecoin.svg';

const LoanCard: React.FC<{ from: string; to?: string; onRepay?: () => void }> = ({ from, to, onRepay }) => {
  const loan = useLoanContract();
  const { assets: assetPack } = useModel('assets.assets');
  const { investorRate: toRate, total: toTotal, sealedPower: toSealedPower } = assetPack;
  const { plan: fromPlan, sealedPower: fromSealedPower, refetch: fromRefetch } = useFromAsset(from);

  const {
    assets,
    reward,
    toPledge,
    toRelease,
    toReward,
    toPledgeCalc,
    fromPledge,
    fromRelease,
    fromReward,
    interest,
    liability,
    drawnReward,
    lockedReward,
    // toPowerRate,
    fromPowerRate,
    isError,
    isLoading,
    refetch,
  } = useLoanAsset(from, to);

  const toRatio = useMemo(() => (toTotal > 0 ? accDiv(toPledgeCalc, toTotal) : 0), [toPledgeCalc, toTotal]);
  const toPower = useMemo(
    () => accMul(accMul(toSealedPower, toRatio), accDiv(toRate, 100)),
    [toSealedPower, toRate, toRatio],
  );

  // const toPower = useMemo(() => accMul(toSealedPower, toPowerRate), [toPowerRate, toSealedPower]);
  const fromPower = useMemo(() => accMul(fromSealedPower, fromPowerRate), [fromPowerRate, fromSealedPower]);

  const refresh = async () => {
    refetch();
    fromRefetch();
  };

  const onLoanRefresh = (id: string) => {
    if (id === from) {
      refetch();
    }
  };

  useEmittHandler({ onLoanRefresh } as any);

  const [setting, handleSettlt] = useProcessify(async () => {
    if (!to) return;

    await loan.postSettle(from, to);

    refresh();
  });

  return (
    <div className="card mb-3">
      <LoadingView
        className=""
        data={assets}
        error={isError}
        loading={isLoading}
        retry={refetch}
        emptyTitle="暫無抵押資產"
      >
        <div className="card-header d-flex flex-column flex-md-row gap-3 bg-warning-tertiary">
          <div className="d-flex align-items-end gap-3 me-auto">
            <IconFil width={48} height={48} />

            <div>
              <p className="mb-0 text-gray">預估結算後可擷取</p>
              <h4 className="mb-0">
                <span className="fs-36 fw-600">{formatAmount(reward, 18)}</span>
                <span className="ms-1 fs-18 fw-bold text-gray">FIL</span>
              </h4>
            </div>
          </div>

          <SpinBtn
            className="btn btn-primary btn-lg mt-auto px-5"
            loading={setting}
            disabled={reward <= 0}
            onClick={handleSettlt}
          >
            結算並擷取
          </SpinBtn>
        </div>
        <div className="card-body">
          <div className="row row-cols-1 row-cols-lg-2 g-3 g-xl-4">
            <div className="col">
              <div className="ffi-form">
                <p className="mb-1 fw-500">鎖定激勵</p>
                <Input
                  className="bg-light text-end"
                  readOnly
                  size="large"
                  suffix="FIL"
                  value={formatAmount(lockedReward, 2)}
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
                  value={formatAmount(drawnReward, 2, 2)}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="card-body border-top">
          <div className="row g-3">
            <div className="col-12 col-xl-6">
              <p className="mb-1 text-gray fw-500">
                <span>扇區質押</span>
                <span className="mx-2">/</span>
                <span>已釋放餘額</span>
              </p>
              <p className="mb-0 fw-600">
                <span className="fs-24">{formatAmount(toPledge)}</span>
                <span className="ms-1 fs-sm fw-bold text-neutral">FIL</span>
                <span className="mx-2 fs-24 fw-light opacity-50">/</span>
                <span className="fs-24">{formatAmount(toRelease)}</span>
                <span className="ms-1 fs-sm fw-bold text-neutral">FIL</span>
              </p>
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <p className="mb-1 text-gray fw-500">我的算力</p>
              <p className="mb-0 fw-600">
                <span className="fs-24">{formatPower(toPower)?.[0]}</span>
                <span className="ms-1 fs-sm fw-bold text-neutral">{formatPower(toPower)?.[1]}</span>
              </p>
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <p className="mb-1 text-gray fw-500">可分配激勵</p>
              <p className="mb-0 fw-600">
                <span className="fs-24">{formatAmount(toReward)}</span>
                <span className="ms-1 fs-sm fw-bold text-neutral">FIL</span>
              </p>
            </div>
          </div>
        </div>
        <div className="card-body border-top">
          <div className="row g-3">
            <div className="col-12 col-xl-6">
              <p className="mb-1 text-gray fw-500">
                <span>抵押品的扇區質押</span>
                <span className="mx-2">/</span>
                <span>已釋放餘額</span>
              </p>
              <p className="mb-0 fw-600">
                <span className="fs-24">{formatAmount(fromPledge)}</span>
                <span className="ms-1 fs-sm fw-bold text-neutral">FIL</span>
                <span className="mx-2 fs-24 fw-light opacity-50">/</span>
                <span className="fs-24">{formatAmount(fromRelease)}</span>
                <span className="ms-1 fs-sm fw-bold text-neutral">FIL</span>
              </p>
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <p className="mb-1 text-gray fw-500">抵押品的算力</p>
              <p className="mb-0 fw-600">
                <span className="fs-24">{formatPower(fromPower)?.[0]}</span>
                <span className="ms-1 fs-sm fw-bold text-neutral">{formatPower(fromPower)?.[1]}</span>
              </p>
            </div>
            <div className="col-12 col-md-6 col-xl-3">
              <p className="mb-1 text-gray fw-500">可分配激勵</p>
              <p className="mb-0 fw-600">
                <span className="fs-24">{formatAmount(fromReward)}</span>
                <span className="ms-1 fs-sm fw-bold text-neutral">FIL</span>
              </p>
            </div>
          </div>
        </div>
        <div className="card-body border-top d-flex justify-content-between gap-3 gap-lg-4">
          <div>
            <p className="mb-1 text-gray fw-500">債務</p>
            <p className="mb-0 fw-600">
              <span className="fs-24">{formatAmount(liability, 4, 2)}</span>
              <span className="ms-1 fs-sm fw-bold text-neutral">FIL</span>
            </p>
          </div>
          <div>
            <p className="mb-1 text-gray fw-500">未償利息</p>
            <p className="mb-0 fw-600">
              <span className="fs-24">{formatAmount(interest, 4, 2)}</span>
              <span className="ms-1 fs-sm fw-bold text-neutral">FIL</span>
            </p>
          </div>
          <div>
            <button className="btn btn-light" type="button" onClick={onRepay}>
              還款
            </button>
          </div>
        </div>
        <div className="card-footer bg-body-tertiary">
          <p className="mb-0">
            <span className="me-2">抵押品來自</span>
            <Link className="text-reset text-underline" to={`/overview/${fromPlan?.raising_id}`}>
              {formatID(from)}@{fromPlan?.miner_id}
            </Link>
          </p>
        </div>
      </LoadingView>
    </div>
  );
};

export default LoanCard;
