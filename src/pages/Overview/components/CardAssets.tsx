import { useMemo } from 'react';
import { Link } from '@umijs/max';

import usePackInfo from '@/hooks/usePackInfo';
import useAssetPack from '@/hooks/useAssetPack';
import useRaiseRate from '@/hooks/useRaiseRate';
import useRaiseRole from '@/hooks/useRaiseRole';
import useDepositOps from '@/hooks/useDepositOps';
import useRaiseState from '@/hooks/useRaiseState';
import { formatAmount, formatPower, formatUnixDate } from '@/utils/format';

const CardAssets: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { data: pack } = usePackInfo(data);
  const { isWorking } = useRaiseState(data);
  const { isRaiser, isServicer } = useRaiseRole(data);
  const { amount: opsBalance } = useDepositOps(data);
  const { raiserRate, opsRate, servicerRate } = useRaiseRate(data);
  const { investorAmount, investorPledge, investorPower, raiserPower } = useAssetPack(data, pack);

  const isInvestor = useMemo(() => investorAmount > 0, [investorAmount]);

  const goDepositCard = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();

    const el = document.querySelector('#deposit');

    el?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  if ((isInvestor || isRaiser || isServicer) && isWorking) {
    return (
      <>
        <div className="card section-card">
          {isInvestor && (
            <>
              <div className="card-header border-0 pt-4 pb-0">
                <h4 className="card-title fw-600 mb-0">我的资产</h4>
              </div>
              <div className="card-body py-2 fs-16 text-main">
                <p className="d-flex align-items-center gap-3 my-3">
                  <span>存入金额</span>
                  <span className="ms-auto">
                    <span className="fs-20 fw-600">{formatAmount(investorAmount)}</span>
                    <span className="ms-1 text-neutral">FIL</span>
                  </span>
                </p>
                <p className="d-flex align-items-center gap-3 my-3">
                  <span>已封装质押</span>
                  <span className="ms-auto">
                    <span className="fs-20 fw-600">{formatAmount(investorPledge, 3, 2)}</span>
                    <span className="ms-1 text-neutral">FIL</span>
                  </span>
                </p>
                <p className="d-flex align-items-center gap-3 my-3">
                  <span>获得算力</span>
                  <span className="ms-auto">
                    <span className="fs-20 fw-600">{formatPower(investorPower)?.[0]}</span>
                    <span className="ms-1 text-neutral">{formatPower(investorPower)?.[1]}</span>
                  </span>
                </p>
                <p className="d-flex align-items-center gap-3 my-3">
                  <span>到期时间</span>
                  <span className="ms-auto fs-20 fw-600">{formatUnixDate(pack?.max_expiration_epoch, 'll')}</span>
                </p>
                <p className="d-flex align-items-center gap-3 my-3">
                  <span>最后释放</span>
                  <span className="ms-auto fs-20 fw-600">{formatUnixDate(pack?.max_expiration_epoch, 'll')}</span>
                </p>
              </div>
            </>
          )}

          {isRaiser && (
            <>
              {isInvestor && <div className="border-top w-75 mx-auto" />}

              <div className="card-header border-0 pt-4 pb-0">
                <h4 className="card-title fw-600 mb-0">我的资产 · 主办人</h4>
              </div>
              <div className="card-body py-2 fs-16 text-main">
                <p className="d-flex align-items-center gap-3 my-3">
                  <span>获得算力</span>
                  <span className="ms-auto">
                    <span className="fs-20 fw-600">{formatPower(raiserPower)?.[0]}</span>
                    <span className="ms-1 text-neutral">{formatPower(raiserPower)?.[1]}</span>
                  </span>
                </p>
                <p className="d-flex align-items-center gap-3 my-3">
                  <span>分配比例</span>
                  <span className="ms-auto">
                    <span className="fs-20 fw-600">{raiserRate}</span>
                    <span className="ms-1 text-neutral">%</span>
                  </span>
                </p>
                <p className="d-flex align-items-center gap-3 my-3">
                  <span>到期时间</span>
                  <span className="ms-auto fs-20 fw-600">{formatUnixDate(pack?.max_expiration_epoch, 'll')}</span>
                </p>
              </div>
            </>
          )}

          {isServicer && (
            <>
              {(isInvestor || isRaiser) && <div className="border-top w-75 mx-auto" />}

              <div className="card-header border-0 pt-4 pb-0">
                <h4 className="card-title fw-600 mb-0">我的资产 · 技术服务商</h4>
              </div>
              <div className="card-body py-2 fs-16 text-main">
                <p className="d-flex align-items-center gap-3 my-3">
                  <span>保证金</span>
                  <span className="ms-auto">
                    <span className="fs-20 fw-600">{formatAmount(opsBalance)}</span>
                    <span className="ms-1 text-neutral">FIL</span>
                  </span>
                </p>
                <p className="d-flex align-items-center gap-3 my-3">
                  <span>分配比例 · 保证金部分</span>
                  <span className="ms-auto">
                    <span className="fs-20 fw-600">{opsRate}</span>
                    <span className="ms-1 text-neutral">%</span>
                  </span>
                </p>
                <p className="d-flex align-items-center gap-3 my-3">
                  <span>分配比例 · 技术服务费部分</span>
                  <span className="ms-auto">
                    <span className="fs-20 fw-600">{servicerRate}</span>
                    <span className="ms-1 text-neutral">%</span>
                  </span>
                </p>
                <p className="d-flex align-items-center gap-3 my-3">
                  <span>到期时间</span>
                  <span className="ms-auto fs-20 fw-600">{formatUnixDate(pack?.max_expiration_epoch, 'll')}</span>
                </p>
              </div>
            </>
          )}
          <div className="card-footer">
            <div className="mb-3">
              <Link className="btn btn-primary btn-lg w-100" to={`/assets/${data?.raising_id}`}>
                领取节点激励
              </Link>
            </div>

            <p className="mb-0 text-gray">
              <span>我的保证金如何取回？ 取回按钮在</span>
              <a className="text-underline" href="#" onClick={goDepositCard}>
                主办人保证金卡片
              </a>
            </p>
          </div>
        </div>
      </>
    );
  }

  return null;
};

export default CardAssets;
