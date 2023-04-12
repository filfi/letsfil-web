import { ReactComponent as Icon } from './imgs/emtpy.svg';

const Empty: React.FC<{ onClick?: () => void }> = ({ onClick }) => {
  return (
    <div className="text-center my-5">
      <Icon />

      <h4>没有募集计划</h4>
      <p>暂时没有募集计划，快去新建一个吧</p>

      <p>
        <button className="btn btn-primary" type="button" onClick={onClick}>
          <i className="bi bi-plus-lg"></i>
          <span className="ms-1">新建募集计划</span>
        </button>
      </p>
    </div>
  );
};

export default Empty;
