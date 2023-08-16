import useMountState from '@/hooks/useMountState';

const MountNav: React.FC<{ data?: API.Plan | null }> = ({ data }) => {
  const { isStarted } = useMountState(data);

  return (
    <ul className="nav nav-pills d-inline-flex flex-lg-column mb-2">
      <li className="nav-item">
        <a className="nav-link" href="#sector">
          挂载节点
        </a>
      </li>
      <li className="nav-item">
        <a className="nav-link" href="#reward">
          分配方案
        </a>
      </li>
      <li className="nav-item">
        <a className="nav-link" href="#details">
          分配明细
        </a>
      </li>
      <li className="nav-item">
        <a className="nav-link" href="#provider">
          服务商
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

export default MountNav;
