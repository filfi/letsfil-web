import classNames from 'classnames';
import { useModel } from '@umijs/max';

import { isTargeted } from '@/helpers/raise';

const NavItem: React.FC<React.PropsWithChildren<{ className?: classNames.Argument; href?: string }>> = ({
  className,
  href,
  children,
}) => {
  return (
    <li className={classNames('nav-item', className)}>
      <a className="nav-link" href={href}>
        {children}
      </a>
    </li>
  );
};

const RaiseNav: React.FC = () => {
  const { plan, role, state } = useModel('Overview.overview');
  const { isRaiser } = role;
  const { isStarted, isSealing, isDelayed, isFinished, isDestroyed } = state;

  return (
    <ul className="nav nav-pills d-inline-flex flex-lg-column mb-2">
      <NavItem href="#raising">質押目標</NavItem>
      {isTargeted(plan) && isRaiser && <NavItem href="#targeted">定向地址</NavItem>}
      {(isSealing || isDelayed || isFinished) && <NavItem href="#seals">封裝進度</NavItem>}
      <NavItem className={{ 'order-3': isSealing, 'order-5': isDelayed || isFinished }} href="#provider">
        服務商
      </NavItem>
      <NavItem className={{ 'order-3': isSealing, 'order-5': isDelayed || isFinished || isDestroyed }} href="#deposit">
        保證金
      </NavItem>
      <NavItem className="order-2" href="#reward">
        分配方案
      </NavItem>
      <NavItem className="order-2" href="#pledge">
        質押的歸屬
      </NavItem>
      <NavItem className="order-3" href="#sector">
        建設方案
      </NavItem>
      <NavItem className="order-4" href="#timeline">
        時間進度
      </NavItem>
      <NavItem className="order-5" href="#contract">
        智能合約
      </NavItem>
      {isStarted && (
        <NavItem className="order-5" href="#events">
          事件
        </NavItem>
      )}
    </ul>
  );
};

export default RaiseNav;
