import { useTitle } from 'ahooks';
import { NavLink, Outlet } from '@umijs/max';

import styles from './layout.less';
import useUser from '@/hooks/useUser';
import Avatar from '@/components/Avatar';
import { formatAddr, formatDate } from '@/utils/format';

export default function AccountLayout() {
  useTitle('个人中心 - FilFi', { restoreOnUnmount: true });

  const { user } = useUser();

  return (
    <>
      <div className={styles.banner}></div>

      <div className="container">
        <div className="d-flex mb-4">
          <div className="flex-shrink-0 me-4">
            <Avatar className={styles.avatar} size={88} src={user?.url} />
          </div>
          <div className="flex-grow-1 mt-auto mb-2">
            <h3 className="mb-0 fs-30 fw-600">{user?.name ?? '未命名'}</h3>
            <p className="mb-0 fs-16 text-gray">
              <span>{formatAddr(user?.address)}&nbsp;</span>
              {user && <span className="ms-2">加入时间 {formatDate(user.CreatedAt, 'll')}</span>}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <ul className="nav nav-tabs ffi-tabs">
            <li className="nav-item">
              <NavLink className="nav-link" to="/account/assets">
                算力资产
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/account/plans">
                节点计划
              </NavLink>
            </li>
            {/* <li className="nav-item">
              <NavLink className="nav-link" to="/account/stats">
                投资报告
              </NavLink>
            </li> */}
          </ul>
        </div>

        <Outlet />
      </div>

      <p>
        <br />
      </p>
    </>
  );
}
