import classNames from 'classnames';

import * as F from '@/utils/format';
import usePackInfo from '@/hooks/usePackInfo';
import useAssetPack from '@/hooks/useAssetPack';
import useChainInfo from '@/hooks/useChainInfo';
import useRaiseSeals from '@/hooks/useRaiseSeals';
import useRaiseState from '@/hooks/useRaiseState';
import useDepositRaiser from '@/hooks/useDepositRaiser';

const SectionSeals: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { baseFee } = useChainInfo();
  const { data: pack } = usePackInfo(data);
  const { fines } = useDepositRaiser(data);
  const { pledge, sector, progress } = useAssetPack(data, pack);
  const { sealsDays, delayedDays, sealedDays, runningDays } = useRaiseSeals(data, pack);
  const { isRaising, isSuccess, isWaitSeal, isWorking, isSealing, isDelayed, isFinished } = useRaiseState(data);

  if (isSuccess || isSealing || isDelayed || isWorking) {
    return (
      <>
        <div className="mb-3 border border-3 rounded-3">
          <div
            className="progress progress-sector position-relative rounded-3"
            role="progressbar"
            aria-label="Sector Progress"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              style={{ width: `${progress * 100}%` }}
              className={classNames('progress-bar', { 'progress-bar-striped progress-bar-animated': isSealing || isDelayed })}
            ></div>
            <span className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center">
              <span className="text-white fw-bold">封装进度 {F.formatRate(progress)}</span>
              {isRaising && <span className="text-white fw-bold">（质押还在进行，进度可能抖动）</span>}
            </span>
          </div>
        </div>

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-1 row-cols-xl-2 g-0">
          <div className="col table-row">
            <div className="row g-0">
              {isFinished ? (
                <>
                  <div className="col-4 table-cell th">完成时间</div>
                  <div className="col-8 table-cell">{F.formatUnixDate(data?.end_seal_time, 'll')}</div>
                </>
              ) : (
                <>
                  <div className="col-4 table-cell th">截止时间</div>
                  <div className="col-8 table-cell">{F.formatUnixDate(data?.end_seal_time, 'll')}</div>
                </>
              )}
            </div>
          </div>
          <div className="col table-row">
            <div className="row g-0">
              <div className="col-4 table-cell th">封装时间</div>
              <div className="col-8 table-cell">
                {isWorking ? <span>{sealedDays}天</span> : isDelayed || isSealing ? <span>第{Math.ceil(runningDays)}天</span> : <span>准备封装</span>}
                <span className="mx-1">/</span>
                <span>承诺{sealsDays}天</span>
              </div>
            </div>
          </div>
          <div className="col table-row">
            <div className="row g-0">
              <div className="col-4 table-cell th">消耗质押</div>
              {isWaitSeal ? <div className="col-8 table-cell text-gray">-</div> : <div className="col-8 table-cell">{F.formatAmount(pledge)} FIL</div>}
            </div>
          </div>
          <div className="col table-row">
            <div className="row g-0">
              <div className="col-4 table-cell th">封装扇区</div>
              {isWaitSeal ? <div className="col-8 table-cell text-gray">-</div> : <div className="col-8 table-cell">{sector} 个</div>}
            </div>
          </div>
          <div className="col table-row">
            <div className="row g-0">
              <div className="col-4 table-cell th">基础费率</div>
              <div className="col-8 table-cell">{F.formatAmount(baseFee)} nanoFIL(24H)</div>
            </div>
          </div>
          <div className="col table-row">
            <div className="row g-0">
              <div className="col-4 table-cell th">违约罚金</div>
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
