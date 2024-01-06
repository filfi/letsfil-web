import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { useDebounceEffect } from 'ahooks';

import styles from '../styles.less';
import { isMountPlan } from '@/helpers/mount';
import FormRadio from '@/components/FormRadio';
import useRaiseRole from '@/hooks/useRaiseRole';
import useDepositInvestor from '@/hooks/useDepositInvestor';
import { ReactComponent as IconStar } from '../imgs/icon-star.svg';
import { ReactComponent as IconTool } from '../imgs/icon-tool.svg';
import { ReactComponent as IconUser } from '../imgs/icon-users.svg';

const AssetsRole: React.FC<{ plan?: API.Plan | null; role: number; onChange?: (role: number) => void }> = ({ plan, role, onChange }) => {
  const [_role, setRole] = useState(role ?? -1);

  const { isInvestor } = useDepositInvestor(plan);
  const { isRaiser, isServicer } = useRaiseRole(plan);

  const roles = useMemo(() => [isInvestor, isRaiser, isServicer, isServicer], [isInvestor, isRaiser, isServicer]);
  const options = useMemo(() => {
    const items = [
      { icon: <IconUser />, label: '我是建设者', value: 0 },
      { icon: <IconStar />, label: '我是主办人', value: 1 },
      { icon: <IconTool />, label: '我是技术服务商', value: 2 },
    ];

    if (plan && !isMountPlan(plan)) {
      items.push({ icon: <IconTool />, label: '运维保证金', value: 3 });
    }

    return items.filter((_, i) => roles[i]);
  }, [roles]);

  const handleChange = (role: number) => {
    setRole(role);

    onChange?.(role);
  };

  useDebounceEffect(
    () => {
      const role = options[0]?.value ?? -1;

      handleChange(role);
    },
    [options],
    { wait: 200 },
  );

  if (options.length > 1) {
    return <FormRadio className={classNames('mb-3', styles.radio)} type="button" value={_role} items={options} onChange={handleChange} />;
  }

  return null;
};

export default AssetsRole;
