import { useTitle } from 'ahooks';
import { Outlet, useIntl } from '@umijs/max';

export default function FSPALayout() {
  const { formatMessage } = useIntl();

  useTitle(`${formatMessage({ id: 'menu.fspa' })} - FilFi`, { restoreOnUnmount: true });

  return <Outlet />;
}
