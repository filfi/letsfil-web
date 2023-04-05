import { Link } from '@umijs/max';

import { ReactComponent as Icon } from './imgs/emtpy.svg';

const Empty: React.FC = () => {
  return (
    <div className="text-center my-5">
      <Icon />

      <h4>没有募集计划</h4>
      <p>暂时没有募集计划，快去新建一个吧</p>

      <p>
        <Link className="btn btn-primary" to="/letsfil/create">
          <i className="bi bi-plus-lg"></i>
          <span className="ms-1">新建募集计划</span>
        </Link>
      </p>
    </div>
  );
};

export default Empty;
