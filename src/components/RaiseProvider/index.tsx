import { useMemo } from 'react';
import { useRequest } from 'ahooks';

import { getInfo } from '@/apis/raise';
import { RaiseContext } from './context';
import useProviders from '@/hooks/useProviders';
import useRaiseInfo from '@/hooks/useRaiseInfo';
import useRaiseRate from '@/hooks/useRaiseRate';
import useIncomeRate from '@/hooks/useIncomeRate';
import useRaiseSeals from '@/hooks/useRaiseSeals';
import useRaiseState from '@/hooks/useRaiseState';
import useAssetPack from '@/hooks/useAssetPack';

const RaiseProvider: React.FC<{ id?: string; children?: React.ReactNode }> = ({ id, children }) => {
  const { data, error, loading, refresh } = useRequest(
    async () => {
      if (id) {
        return await getInfo(id);
      }
    },
    { refreshDeps: [id] },
  );

  const { getProvider } = useProviders();

  const asset = useAssetPack(data);
  const rate = useRaiseRate(data);
  const info = useRaiseInfo(data);
  const state = useRaiseState(data);
  const income = useIncomeRate(data);
  const seals = useRaiseSeals(data, asset.pack);

  const provider = useMemo(() => getProvider(data?.service_id), [data?.service_id, getProvider]);

  return (
    <RaiseContext.Provider value={{ data, error, loading, income, info, asset, rate, seals, state, provider, refresh, getProvider }}>
      {children}
    </RaiseContext.Provider>
  );
};

export default RaiseProvider;
