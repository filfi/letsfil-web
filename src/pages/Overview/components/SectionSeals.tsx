import { useMemo } from 'react';
import classNames from 'classnames';
import { useModel } from '@umijs/max';

import * as F from '@/utils/format';
import { accSub, sec2day } from '@/utils/utils';
import useChainInfo from '@/hooks/useChainInfo';
import useRaiseSeals from '@/hooks/useRaiseSeals';
import useDepositRaiser from '@/hooks/useDepositRaiser';

function fmtWidth(val: number) {
  if (val >= 0.99 && val <= 1) return 100;

  return val * 100;
}

function fmtProgress(progress: number) {
  if (progress >= 0.99 && progress <= 1) {
    return F.formatRate(1);
  }

  return F.formatRate(progress);
}

const SectionSeals: React.FC = () => {
  const { assets, pack, plan, state } = useModel('Overview.overview');

  const { baseFee } = useChainInfo();
  const { fines } = useDepositRaiser(plan);
  const { sealsDays, delayedDays, sealedDays, runningDays } = useRaiseSeals(plan, pack);

  const { sealedPledge, sealedSector, sealProgress } = assets;
  const { isRaising, isSuccess, isWaitSeal, isWorking, isSealing, isDelayed, isFinished } = state;

  const days = useMemo(() => sec2day(accSub(plan?.end_seal_time ?? 0, plan?.begin_seal_time ?? 0)), [plan]);
  const aheadDays = useMemo(() => accSub(days, sealsDays), [days, sealsDays]);

  if (isSuccess || isSealing || isDelayed || isWorking) {
    return (
      <>
        <div className="mb-3 border border-3 rounded-3">
          <div
            className="progress progress-sector position-relative rounded-3"
            role="progressbar"
            aria-label="Sector Progress"
            aria-valuenow={sealProgress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              style={{ width: `${fmtWidth(sealProgress)}%` }}
              className={classNames('progress-bar', {
                'progress-bar-striped progress-bar-animated': isSealing || isDelayed,
              })}
            ></div>
            <span className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center">
              <span className="text-white fw-bold">封裝進度 {fmtProgress(sealProgress)}</span>
              {isRaising && <span className="text-white fw-bold">（質押還在進行，進度可能會抖動）</span>}
            </span>
          </div>
        </div>

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-1 row-cols-xl-2 g-0">
          <div className="col table-row">
            <div className="row g-0">
              {isFinished ? (
                <>
                  <div className="col-4 table-cell th">完成時間</div>
                  <div className="col-8 table-cell">{F.formatUnixDate(plan?.end_seal_time, 'll')}</div>
                </>
              ) : (
                <>
                  <div className="col-4 table-cell th">截止時間</div>
                  <div className="col-8 table-cell">{F.formatUnixDate(plan?.end_seal_time, 'll')}</div>
                </>
              )}
            </div>
          </div>
          <div className="col table-row">
            <div className="row g-0">
              <div className="col-4 table-cell th">封裝時間</div>
              <div className="col-8 table-cell">
                {isWorking ? (
                  <span>{sealedDays}天</span>
                ) : isDelayed || isSealing ? (
                  <span>第{Math.ceil(runningDays)}天</span>
                ) : (
                  <span>準備封裝</span>
                )}
                <span className="mx-1">/</span>
                {isDelayed || isSealing ? (
                  <>
                    <span className="me-1">{days}天</span>
                    <span>
                      <span>(</span>
                      {aheadDays > 0 && <span>提早{aheadDays} + </span>}
                      <span>承諾{sealsDays}</span>
                      <span>)</span>
                    </span>
                  </>
                ) : (
                  <span>承諾{sealsDays}天</span>
                )}
              </div>
            </div>
          </div>
          <div className="col table-row">
            <div className="row g-0">
              <div className="col-4 table-cell th">消耗質押</div>
              {isWaitSeal ? (
                <div className="col-8 table-cell text-gray">-</div>
              ) : (
                <div className="col-8 table-cell">{F.formatAmount(sealedPledge)} FIL</div>
              )}
            </div>
          </div>
          <div className="col table-row">
            <div className="row g-0">
              <div className="col-4 table-cell th">封裝扇區</div>
              {isWaitSeal ? (
                <div className="col-8 table-cell text-gray">-</div>
              ) : (
                <div className="col-8 table-cell">{sealedSector} 个</div>
              )}
            </div>
          </div>
          <div className="col table-row">
            <div className="row g-0">
              <div className="col-4 table-cell th">基礎費率</div>
              <div className="col-8 table-cell">{F.formatAmount(baseFee)} nanoFIL(24H)</div>
            </div>
          </div>
          <div className="col table-row">
            <div className="row g-0">
              <div className="col-4 table-cell th">違約罰金</div>
              {delayedDays ? (
                <div className="col-8 table-cell">
                  <span className="me-auto">{F.formatAmount(fines, 2, 2)} FIL</span>
                  {/* {isDelayed && fines > 0 && (
                    <a className="text-underline" href="#fines-modal" data-bs-toggle="modal">
                      这是什么？
                    </a>
                  )} */}
                </div>
              ) : (
                <div className="col-8 table-cell text-gray">-</div>
              )}
            </div>
          </div>
        </div>
      </>
    );
  }

  return null;
};

export default SectionSeals;
