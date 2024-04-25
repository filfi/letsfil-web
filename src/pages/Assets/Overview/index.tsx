import { useState } from 'react';

import AssetsLoan from './components/AssetsLoan';
import AssetsMain from './components/AssetsMain';
import AssetsRole from './components/AssetsRole';
import AssetsReward from './components/AssetsReward';

export default function AssetsOverview() {
  const [role, setRole] = useState(-1);

  return (
    <>
      <AssetsRole role={role} onChange={setRole} />

      <AssetsReward role={role} />

      <AssetsMain role={role} />

      {role === 0 && <AssetsLoan />}
    </>
  );
}
