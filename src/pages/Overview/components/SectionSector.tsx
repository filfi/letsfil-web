import { useMemo } from 'react';
import classNames from 'classnames';

import useRaiseState from '@/hooks/useRaiseState';
import { formatUnixDate } from '@/utils/format';
import { accDiv, sec2day } from '@/utils/utils';

const SectionSector: React.FC<{ data?: API.Plan }> = ({ data }) => {
  const { isDelayed, isFinished } = useRaiseState(data);
  const period = useMemo(() => data?.seal_days ?? 0, [data?.seal_days]);
  const hibit = useMemo(() => accDiv(period, 2), [period]);
  const seconds = useMemo(() => (data?.begin_seal_time ? Date.now() - data.begin_seal_time : 0), [data?.begin_seal_time]);
  const days = useMemo(() => sec2day(seconds), [seconds]);
  const total = useMemo(() => (isDelayed ? period + hibit : period), [hibit, period, isDelayed]);
  const percent = useMemo(() => (total > 0 ? accDiv(days, total) : 0), [days, total]);

  if (data) {
    return (
      <>
        <div className="pt-3 mb-3">
          <div className="progress-stacked progress-sector">
            <div
              className={classNames('indicator', { warning: isDelayed, success: isFinished })}
              style={{ left: isFinished ? 'calc(100% - 23px)' : `calc((100% - 46px) * ${percent})` }}
            >
              <span className="indicator-label">{days} 天</span>
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
              {isFinished ? (
                <tr>
                  <th>完成时间</th>
                  <td>{formatUnixDate(data.end_seal_time)}</td>
                  <th>已封装扇区</th>
                  <td>0 个</td>
                </tr>
              ) : (
                <tr>
                  <th>已进行</th>
                  <td>{days} 天</td>
                  <th>已封装扇区</th>
                  <td>0 个</td>
                </tr>
              )}
              <tr>
                <th>消耗质押币</th>
                <td>0 个</td>
                <th>完成比例</th>
                <td>0 %</td>
              </tr>
              {isDelayed ? (
                <tr>
                  <th>超期时间</th>
                  <td>{sec2day(Date.now() - data.delay_seal_time)} 天</td>
                  <th>累计罚金</th>
                  <td>
                    <span className="me-auto">0 FIL</span>
                    <a className="text-underline" href="#">
                      这是什么？
                    </a>
                  </td>
                </tr>
              ) : (
                <tr>
                  <th>超期时间</th>
                  <td>0 天</td>
                  <th>累计罚金</th>
                  <td>0 FIL</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </>
    );
  }

  return null;
};

export default SectionSector;
