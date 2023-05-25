import { useMemo } from 'react';
import { Link } from '@umijs/max';

import useRaiseRate from '@/hooks/useRaiseRate';
import useRaiseState from '@/hooks/useRaiseState';
import useDepositInvest from '@/hooks/useDepositInvest';
import { accDiv, accMul, isDef } from '@/utils/utils';
import { formatAmount, formatEther, formatNum, formatUnixDate } from '@/utils/format';

function formatByte(val?: number | string) {
  if (isDef(val)) {
    return formatNum(val, '0.0 ib').split(' ');
  }
}

const CardAssets: React.FC<{ data?: API.Plan; pack?: API.AssetPack }> = ({ data, pack }) => {
  const { amount, total } = useDepositInvest(data);
  const { isRaiser, isServicer, isFinished } = useRaiseState(data);
  const { investRate, raiserRate, opsRate, servicerRate } = useRaiseRate(data);

  const power = useMemo(() => +`${pack?.pack_power || '0'}`, [pack?.pack_power]);
  const iRate = useMemo(() => (total > 0 ? accDiv(amount, total) : 0), [amount, total]);
  const raiserPower = useMemo(() => accMul(power, accDiv(raiserRate, 100)), [power, raiserRate]);
  const investPower = useMemo(() => accMul(accMul(power, accDiv(investRate, 100)), iRate), [power, investRate, iRate]);

  const goDepositCard = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();

    const el = document.querySelector('#deposit');

    el?.scrollIntoView({
      behavior: 'smooth',
    });
  };

  if (isFinished) {
    return (
      <div className="card section-card">
        <div className="card-header border-0 pt-4 pb-0">
          <h4 className="card-title fw-600 mb-0">我的资产</h4>
        </div>
        <div className="card-body py-2 fs-16 text-main">
          <p className="d-flex align-items-center gap-3 my-3">
            <span>存入金额</span>
            <span className="ms-auto">
              <span className="fs-20 fw-600">{formatAmount(amount)}</span>
              <span className="ms-1 text-neutral">FIL</span>
            </span>
          </p>
          <p className="d-flex align-items-center gap-3 my-3">
            <span>实际投入</span>
            <span className="ms-auto">
              <span className="fs-20 fw-600">{formatAmount(amount)}</span>
              <span className="ms-1 text-neutral">FIL</span>
            </span>
          </p>
          <p className="d-flex align-items-center gap-3 my-3">
            <span>获得算力</span>
            <span className="ms-auto">
              <span className="fs-20 fw-600">{formatByte(investPower)?.[0]}</span>
              <span className="ms-1 text-neutral">{formatByte(investPower)?.[1]}</span>
            </span>
          </p>
          <p className="d-flex align-items-center gap-3 my-3">
            <span>到期时间</span>
            <span className="ms-auto fs-20 fw-600">{formatUnixDate(pack?.sector_end_expira, 'll')}</span>
          </p>
          <p className="d-flex align-items-center gap-3 my-3">
            <span>最后释放</span>
            <span className="ms-auto fs-20 fw-600">{formatUnixDate(pack?.sector_end_expira, 'll')}</span>
          </p>
        </div>

        {isRaiser && (
          <>
            <div className="border-top w-75 mx-auto" />

            <div className="card-header border-0 pt-4 pb-0">
              <h4 className="card-title fw-600 mb-0">我的资产 · 发起人</h4>
            </div>
            <div className="card-body py-2 fs-16 text-main">
              <p className="d-flex align-items-center gap-3 my-3">
                <span>获得算力</span>
                <span className="ms-auto">
                  <span className="fs-20 fw-600">{formatByte(raiserPower)?.[0]}</span>
                  <span className="ms-1 text-neutral">{formatByte(raiserPower)?.[1]}</span>
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
                <span className="ms-auto fs-20 fw-600">{formatUnixDate(pack?.sector_end_expira, 'll')}</span>
              </p>
            </div>
          </>
        )}

        {isServicer && (
          <>
            <div className="border-top w-75 mx-auto" />

            <div className="card-header border-0 pt-4 pb-0">
              <h4 className="card-title fw-600 mb-0">我的资产 · 技术服务商</h4>
            </div>
            <div className="card-body py-2 fs-16 text-main">
              <p className="d-flex align-items-center gap-3 my-3">
                <span>保证金</span>
                <span className="ms-auto">
                  <span className="fs-20 fw-600">{formatEther(data?.ops_security_fund)}</span>
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
                <span className="ms-auto fs-20 fw-600">{formatUnixDate(pack?.sector_end_expira, 'll')}</span>
              </p>
            </div>
          </>
        )}
        <div className="card-footer">
          <div className="mb-3">
            <Link className="btn btn-primary btn-lg w-100" to={`/assets/${data?.raising_id}`}>
              领取收益
            </Link>
          </div>

          <p className="mb-0 text-gray">
            <span>我的保证金如何取回？ 取回按钮在</span>
            <a className="text-underline" href="#" onClick={goDepositCard}>
              发起人保证金卡片
            </a>
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default CardAssets;
