import { useModel } from '@umijs/max';

import useMountState from '@/hooks/useMountState';

const MountNav: React.FC = () => {
  const { plan } = useModel('Overview.overview');
  const { isStarted } = useMountState(plan);

  return (
    <ul className="nav nav-pills d-inline-flex flex-lg-column mb-2">
      <li className="nav-item">
        <a className="nav-link" href="#sector">
          掛載節點
        </a>
      </li>
      <li className="nav-item">
        <a className="nav-link" href="#reward">
          分配方案
        </a>
      </li>
      <li className="nav-item">
        <a className="nav-link" href="#details">
          分配明細
        </a>
      </li>
      <li className="nav-item">
        <a className="nav-link" href="#provider">
          服務商
        </a>
      </li>
      <li className="nav-item order-5">
        <a className="nav-link" href="#contract">
          智能合約
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

export default MountNav;
