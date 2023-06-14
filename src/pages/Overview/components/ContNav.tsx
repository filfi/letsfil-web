import classNames from 'classnames';

import useRaiseState from '@/hooks/useRaiseState';

const ContNav: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { isStarted, isSuccess, isSealing, isDelayed, isFinished, isDestroyed } = useRaiseState(data);

  return (
    <ul className="nav nav-pills d-inline-flex flex-lg-column mb-2">
      <li className="nav-item">
        <a className="nav-link" href="#raising">
          质押目标
        </a>
      </li>
      <li className={classNames('nav-item', { 'order-3': isSealing, 'order-5': isDelayed || isFinished })}>
        <a className="nav-link" href="#provider">
          服务商
        </a>
      </li>
      <li className={classNames('nav-item', { 'order-3': isSealing, 'order-5': isDelayed || isFinished || isDestroyed })}>
        <a className="nav-link" href="#deposit">
          保证金
        </a>
      </li>
      <li className="nav-item order-2">
        <a className="nav-link" href="#reward">
          分配方案
        </a>
      </li>
      <li className="nav-item order-2">
        <a className="nav-link" href="#pledge">
          质押的归属
        </a>
      </li>
      <li className="nav-item order-3">
        <a className="nav-link" href="#sector">
          建设方案
        </a>
      </li>
      {isSuccess && !isDestroyed && (
        <li className={classNames('nav-item', { 'order-1': isSealing || isDelayed || isFinished })}>
          <a className="nav-link" href="#seals">
            封装进度
          </a>
        </li>
      )}
      <li className="nav-item order-4">
        <a className="nav-link" href="#timeline">
          时间进度
        </a>
      </li>
      <li className="nav-item order-5">
        <a className="nav-link" href="#contract">
          智能合约
        </a>
      </li>
      {isStarted && (
        <li className="nav-item order-5">
          <a className="nav-link" href="#events">
            事件
          </a>
        </li>
      )}
    </ul>
  );
};

export default ContNav;
