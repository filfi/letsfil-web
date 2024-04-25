import { useTitle } from 'ahooks';
import { Outlet, useIntl } from '@umijs/max';

export default function LendingLayout() {
  const { formatMessage } = useIntl();

  useTitle(`${formatMessage({ id: 'menu.lending' })} - FilFi`, { restoreOnUnmount: true });

  return (
    <div className="ffi-stake">
      <Outlet />
    </div>
  );
}
