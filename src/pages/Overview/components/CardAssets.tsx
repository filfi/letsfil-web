import { Link, useModel } from '@umijs/max';

import { formatAmount, formatPower, formatUnixDate } from '@/utils/format';

const CardAssets: React.FC = () => {
  const { pack, plan, assets, rate, state } = useModel('Overview.overview');
  const { isWorking } = state;
  const { raiserRate, opsRate, superRate, servicerRate } = rate;
  const {
    isInvestor,
    isRaiser,
    isServicer,
    leverage,
    totalPledge,
    investorPledge,
    raiserPower,
    investorPower,
    opsAction,
  } = assets;

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
        <div className="card section-card sticky-card">
          {isInvestor && (
            <>
              <div className="card-header border-0 pt-4 pb-0">
                <h4 className="card-title fw-600 mb-0">我的資產</h4>
              </div>
              <div className="card-body py-2 fs-16 text-main">
                <p className="d-flex align-items-center gap-3 my-3">
                  <span>存入數量</span>
                  <span className="ms-auto">
                    <span className="fs-20 fw-600">{formatAmount(totalPledge)}</span>
                    <span className="ms-1 text-neutral">FIL</span>
                  </span>
                </p>
                <p className="d-flex align-items-center gap-3 my-3">
                  <span>實際封裝</span>
                  <span className="ms-auto">
                    <span className="fs-20 fw-600">{formatAmount(investorPledge, 3, 2)}</span>
                    <span className="ms-1 text-neutral">FIL</span>
                  </span>
                </p>
                <p className="d-flex align-items-center gap-3 my-3">
                  <span>獲得算力</span>
                  <span className="ms-auto">
                    <span className="fs-20 fw-600">{formatPower(investorPower)?.[0]}</span>
                    <span className="ms-1 text-neutral">{formatPower(investorPower)?.[1]}</span>
                  </span>
                </p>
                <p className="d-flex align-items-center gap-3 my-3">
                  <span>到期時間</span>
                  <span className="ms-auto fs-20 fw-600">{formatUnixDate(pack?.max_expiration_epoch, 'll')}</span>
                </p>
                <p className="d-flex align-items-center gap-3 my-3">
                  <span>最後釋放</span>
                  <span className="ms-auto fs-20 fw-600">{formatUnixDate(pack?.max_expiration_epoch, 'll')}</span>
                </p>
              </div>
            </>
          )}

          {isRaiser && (
            <>
              {isInvestor && <div className="border-top w-75 mx-auto" />}

              <div className="card-header border-0 pt-4 pb-0">
                <h4 className="card-title fw-600 mb-0">我的資產 · 主办人</h4>
              </div>
              <div className="card-body py-2 fs-16 text-main">
                <p className="d-flex align-items-center gap-3 my-3">
                  <span>獲得算力</span>
                  <span className="ms-auto">
                    <span className="fs-20 fw-600">{formatPower(raiserPower)?.[0]}</span>
                    <span className="ms-1 text-neutral">{formatPower(raiserPower)?.[1]}</span>
                  </span>
                </p>
                <p className="d-flex align-items-center gap-3 my-3">
                  <span>分配比例</span>
                  <span className="ms-auto">
                    <span className="fs-20 fw-600">{raiserRate || superRate}</span>
                    <span className="ms-1 text-neutral">%</span>
                  </span>
                </p>
                <p className="d-flex align-items-center gap-3 my-3">
                  <span>到期時間</span>
                  <span className="ms-auto fs-20 fw-600">{formatUnixDate(pack?.max_expiration_epoch, 'll')}</span>
                </p>
              </div>
            </>
          )}

          {isServicer && (
            <>
              {(isInvestor || isRaiser) && <div className="border-top w-75 mx-auto" />}

              <div className="card-header border-0 pt-4 pb-0">
                <h4 className="card-title fw-600 mb-0">我的資產 · 技術服務商</h4>
              </div>
              <div className="card-body py-2 fs-16 text-main">
                <p className="d-flex align-items-center gap-3 my-3">
                  <span>保證金</span>
                  <span className="ms-auto">
                    <span className="fs-20 fw-600">{formatAmount(opsAction.amount)}</span>
                    <span className="ms-1 text-neutral">FIL</span>
                  </span>
                </p>
                <p className="d-flex align-items-center gap-3 my-3">
                  <span>分配比例 · 保證金部分</span>
                  <span className="ms-auto">
                    <span className="fs-20 fw-600">{opsRate}</span>
                    <span className="ms-1 text-neutral">%</span>
                  </span>
                </p>
                <p className="d-flex align-items-center gap-3 my-3">
                  <span>分配比例 · 技術服務費部分</span>
                  <span className="ms-auto">
                    <span className="fs-20 fw-600">{servicerRate}</span>
                    <span className="ms-1 text-neutral">%</span>
                  </span>
                </p>
                <p className="d-flex align-items-center gap-3 my-3">
                  <span>到期時間</span>
                  <span className="ms-auto fs-20 fw-600">{formatUnixDate(pack?.max_expiration_epoch, 'll')}</span>
                </p>
              </div>
            </>
          )}
          <div className="card-footer">
            <div className="mb-3">
              <Link
                className="btn btn-primary btn-lg w-100"
                to={
                  leverage && leverage > 0
                    ? `/assets/leverage/${plan?.raising_id}`
                    : `/assets/overview/${plan?.raising_id}`
                }
              >
                領取節點激勵
              </Link>
            </div>

            <p className="mb-0 text-gray">
              <span>我的保證金如何取回？ 取回按钮在</span>
              <a className="text-underline" href="#" onClick={goDepositCard}>
                主辦人保證金卡片
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
