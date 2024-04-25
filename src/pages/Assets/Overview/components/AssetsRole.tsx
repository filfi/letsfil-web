import classNames from 'classnames';
import { useModel } from '@umijs/max';
import { useMemo, useState } from 'react';
import { useDebounceEffect } from 'ahooks';

import styles from '../styles.less';
import { isMountPlan } from '@/helpers/mount';
import FormRadio from '@/components/FormRadio';
import { ReactComponent as IconStar } from '../imgs/icon-star.svg';
import { ReactComponent as IconTool } from '../imgs/icon-tool.svg';
import { ReactComponent as IconUser } from '../imgs/icon-users.svg';

const AssetsRole: React.FC<{ role: number; onChange?: (role: number) => void }> = ({ role, onChange }) => {
  const [_role, setRole] = useState(role ?? -1);

  const { assets, plan } = useModel('assets.assets');
  const { pledge, collateral, isRaiser, isServicer } = assets;

  const isInvestor = useMemo(() => collateral > 0 || pledge > 0, [collateral, pledge]);

  const roles = useMemo(() => [isInvestor, isRaiser, isServicer, isServicer], [isInvestor, isRaiser, isServicer]);
  const options = useMemo(() => {
    const items = [
      { icon: <IconUser />, label: '我是建設者', value: 0 },
      { icon: <IconStar />, label: '我是主辦人', value: 1 },
      { icon: <IconTool />, label: '我是技術服務商', value: 2 },
    ];

    if (plan && !isMountPlan(plan)) {
      items.push({ icon: <IconTool />, label: '運維保證金', value: 3 });
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
    return (
      <FormRadio
        className={classNames('mb-3', styles.radio)}
        type="button"
        value={_role}
        items={options}
        onChange={handleChange}
      />
    );
  }

  return null;
};

export default AssetsRole;
