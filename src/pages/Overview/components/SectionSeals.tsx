import { useMemo } from 'react';
import classNames from 'classnames';

import * as F from '@/utils/format';
// import Modal from '@/components/Modal';
import usePackInfo from '@/hooks/usePackInfo';
import useAssetPack from '@/hooks/useAssetPack';
import useRaiseSeals from '@/hooks/useRaiseSeals';
import useRaiseState from '@/hooks/useRaiseState';
import useDepositRaiser from '@/hooks/useDepositRaiser';
import { accAdd, accDiv, sec2day } from '@/utils/utils';

const SectionSeals: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { data: pack } = usePackInfo(data);
  const { fines } = useDepositRaiser(data);
  const { pledge, sector, progress } = useAssetPack(data, pack);
  const { isWorking, isSealing, isDelayed, isFinished } = useRaiseState(data);
  const { sealsDays, delayedDays, sealedDays, runningDays } = useRaiseSeals(data, pack);

  const hibit = useMemo(() => (isDelayed ? accDiv(sealsDays, 2) : 0), [sealsDays, isDelayed]);
  const total = useMemo(() => accAdd(sealsDays, hibit), [hibit, sealsDays]);
  const percent = useMemo(() => (total > 0 ? Math.min(accDiv(runningDays, total), 1) : 0), [runningDays, total]);

  if (isSealing || isDelayed || isWorking) {
    return (
      <>
        <div className="pt-3 mb-3">
          <div className="progress-stacked progress-sector">
            <div
              className={classNames('indicator', { warning: isDelayed, success: isFinished })}
              style={{ left: isFinished ? 'calc(100% - 23px)' : `calc((100% - 46px) * ${percent})` }}
            >
              <span className="indicator-label">{isFinished ? sealedDays : F.formatSeals(runningDays)} 天</span>
              <span className="indicator-caret"></span>
            </div>
            <div className="progress-stacked flex-fill">
              <div
                className="progress"
                role="progressbar"
                aria-label="Processing"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={isDelayed ? 66.67 : 100}
                style={{ width: data?.delay_seal_time ? '66.6666%' : '100%' }}
              >
                <div className={classNames('progress-bar', { 'progress-bar-striped progress-bar-animated': isSealing })}>
                  <span className="fw-bold">承诺封装时间·{sealsDays}天</span>
                </div>
              </div>
              {!!(data && data?.delay_seal_time) && (
                <div
                  className="progress progress-warning"
                  role="progressbar"
                  aria-label="Delayed"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={33.33}
                  style={{ width: '33.3333%' }}
                >
                  <div className={classNames('progress-bar', { 'progress-bar-striped progress-bar-animated': isDelayed })}>
                    <span className="fw-bold">展期·{hibit}天</span>
                  </div>
                </div>
              )}
            </div>
            <div
              className="progress progress-success"
              role="progressbar"
              aria-label="Finished"
              aria-valuenow={5}
              aria-valuemin={0}
              aria-valuemax={100}
              style={{ width: 46 }}
            >
              <div className="progress-bar fw-bold">结束</div>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="table">
            <tbody>
              <tr>
                {isDelayed ? (
                  <>
                    <th>展期截止</th>
                    <td>{F.formatUnixDate(data?.delay_seal_time, 'll')}</td>
                  </>
                ) : isFinished ? (
                  <>
                    <th>完成时间</th>
                    <td>{F.formatUnixDate(data?.end_seal_time, 'll')}</td>
                  </>
                ) : (
                  <>
                    <th>截止时间</th>
                    <td>{F.formatUnixDate(data?.end_seal_time, 'll')}</td>
                  </>
                )}
                <th>已封装扇区</th>
                <td>{sector} 个</td>
              </tr>
              <tr>
                <th>消耗质押</th>
                <td>{F.formatAmount(pledge)} FIL</td>
                <th>封装进度</th>
                <td>{F.formatRate(progress)}</td>
              </tr>
              {delayedDays ? (
                <tr>
                  <th>超期时间</th>
                  <td>{sec2day(delayedDays)} 天</td>
                  <th>累计罚金</th>
                  <td>
                    <span className="me-auto">{F.formatAmount(fines, 2, 2)} FIL</span>
                    {/* {isDelayed && fines > 0 && (
                      <a className="text-underline" href="#fines-modal" data-bs-toggle="modal">
                        这是什么？
                      </a>
                    )} */}
                  </td>
                </tr>
              ) : (
                <tr>
                  <th>超期时间</th>
                  <td>-</td>
                  <th>累计罚金</th>
                  <td>-</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* <Modal.Alert id="fines-modal" title="累计罚金" confirmText="我知道了">
          <div className="card">
            <div className="card-body">
              <p>累计罚金说明</p>
            </div>
          </div>
        </Modal.Alert> */}
      </>
    );
  }

  return (
    <>
      <div className="pt-3 mb-3">
        <div className="progress-stacked progress-sector opacity-50">
          <div className={classNames('indicator')} style={{ left: 'calc((100% - 46px) * 0)' }}>
            <span className="indicator-label">0 天</span>
            <span className="indicator-caret"></span>
          </div>
          <div className="progress-stacked flex-fill">
            <div className="progress w-100" role="progressbar" aria-label="Processing" aria-valuemin={0} aria-valuemax={100} aria-valuenow={100}>
              <div className="progress-bar fw-bold">封装时间 · {sealsDays}天</div>
            </div>
          </div>
          <div
            className="progress progress-success"
            role="progressbar"
            aria-label="Finished"
            aria-valuenow={5}
            aria-valuemin={0}
            aria-valuemax={100}
            style={{ width: 46 }}
          >
            <div className="progress-bar fw-bold">结束</div>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table">
          <tbody>
            <tr>
              <th>截止时间</th>
              <td>准备封装</td>
              <th>已封装扇区</th>
              <td>-</td>
            </tr>
            <tr>
              <th>消耗质押</th>
              <td>-</td>
              <th>封装进度</th>
              <td>-</td>
            </tr>
            <tr>
              <th>超期时间</th>
              <td>-</td>
              <th>累计罚金</th>
              <td>-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
};

export default SectionSeals;
