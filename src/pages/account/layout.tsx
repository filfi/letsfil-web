import { useTitle } from 'ahooks';
import { NavLink, Outlet } from '@umijs/max';

import styles from './layout.less';
import useUser from '@/hooks/useUser';
import Avatar from '@/components/Avatar';
import { formatAddr, formatDate, formatSponsor } from '@/utils/format';

export default function AccountLayout() {
  useTitle('個人中心 - FilFi', { restoreOnUnmount: true });

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
            <h3 className="mb-0 display-7 fw-600">{formatSponsor(user?.name ?? '未命名')}</h3>
            <p className="mb-0 fs-16 text-gray">
              <span>{formatAddr(user?.address)}&nbsp;</span>
              {user && <span className="ms-2">加入時間 {formatDate(user.CreatedAt, 'll')}</span>}
            </p>
          </div>
        </div>

        <div className="mb-4">
          <ul className="nav nav-tabs ffi-tabs">
            <li className="nav-item">
              <NavLink className="nav-link" to="/account/assets">
                算力資產
              </NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link" to="/account/plans">
                聯合節點
              </NavLink>
            </li>
            {/* <li className="nav-item">
              <NavLink className="nav-link" to="/account/stats">
                投資報告
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
