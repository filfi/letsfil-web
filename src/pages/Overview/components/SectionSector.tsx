import { useMemo } from 'react';
import classNames from 'classnames';

import * as F from '@/utils/format';
// import Modal from '@/components/Modal';
import useRaiseDetail from '@/hooks/useRaiseDetail';
import useDepositRaiser from '@/hooks/useDepositRaiser';
import { accAdd, accDiv, accSub, day2sec, sec2day } from '@/utils/utils';

const SectionSector: React.FC = () => {
  const { data, asset, seals, state } = useRaiseDetail();

  const { fines } = useDepositRaiser(data);
  const { pledge, sector } = asset;
  const { period, sealdays, running, progress } = seals;
  const { isWorking, isSealing, isDelayed, isFinished } = state;

  const hibit = useMemo(() => (isDelayed ? accDiv(period, 2) : 0), [period, isDelayed]);
  const total = useMemo(() => accAdd(period, hibit), [hibit, period]);
  const percent = useMemo(() => (total > 0 ? Math.min(accDiv(running, total), 1) : 0), [running, total]);
  const delay = useMemo(() => {
    if (data?.delay_seal_time) {
      return accSub(Date.now() / 1000, data.begin_seal_time, day2sec(data.seal_days));
    }

    return 0;
  }, [data]);

  if (isSealing || isDelayed || isWorking) {
    return (
      <>
        <div className="pt-3 mb-3">
          <div className="progress-stacked progress-sector">
            <div
              className={classNames('indicator', { warning: isDelayed, success: isFinished })}
              style={{ left: isFinished ? 'calc(100% - 23px)' : `calc((100% - 46px) * ${percent})` }}
            >
              <span className="indicator-label">{isFinished ? sealdays : F.formatSeals(running)} 天</span>
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
                style={{ width: isDelayed ? '66.6666%' : '100%' }}
              >
                <div className="progress-bar fw-bold">承诺封装时间·{period}天</div>
              </div>
              {isDelayed && (
                <div
                  className="progress progress-warning"
                  role="progressbar"
                  aria-label="Delayed"
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={33.33}
                  style={{ width: '33.3333%' }}
                >
                  <div className="progress-bar fw-bold">展期·{hibit}天</div>
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
                    <td>{F.formatUnixDate(data?.delay_seal_time)}</td>
                  </>
                ) : isFinished ? (
                  <>
                    <th>完成时间</th>
                    <td>{F.formatUnixDate(data?.end_seal_time)}</td>
                  </>
                ) : (
                  <>
                    <th>截止时间</th>
                    <td>{F.formatUnixDate(data?.end_seal_time)}</td>
                  </>
                )}
                <th>已封装扇区</th>
                <td>{sector} 个</td>
              </tr>
              <tr>
                <th>消耗质押币</th>
                <td>{F.formatAmount(pledge)} FIL</td>
                <th>完成比例</th>
                <td>{F.formatRate(progress)}</td>
              </tr>
              {delay ? (
                <tr>
                  <th>超期时间</th>
                  <td>{sec2day(delay)} 天</td>
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
              <div className="progress-bar fw-bold">承诺封装时间·{period}天</div>
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
              <th>消耗质押币</th>
              <td>-</td>
              <th>完成比例</th>
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

export default SectionSector;
