import { useMemo } from 'react';
import { useRequest } from 'ahooks';

import { getInfo } from '@/apis/raise';
import { packInfo } from '@/apis/packs';
import { RaiseContext } from './context';
import useProviders from '@/hooks/useProviders';
import useRaiseInfo from '@/hooks/useRaiseInfo';
import useRaiseRate from '@/hooks/useRaiseRate';
import useIncomeRate from '@/hooks/useIncomeRate';
import useRaiseSeals from '@/hooks/useRaiseSeals';
import useRaiseState from '@/hooks/useRaiseState';

const RaiseProvider: React.FC<{ id?: string; children?: React.ReactNode }> = ({ id, children }) => {
  const {
    data,
    error,
    loading,
    refresh: refreshData,
  } = useRequest(
    async () => {
      if (id) {
        return await getInfo(id);
      }
    },
    { refreshDeps: [id] },
  );
  const { data: pack, refresh: refreshPack } = useRequest(
    async () => {
      if (id) {
        return await packInfo(id);
      }
    },
    { refreshDeps: [id] },
  );

  const { getProvider } = useProviders();

  const rate = useRaiseRate(data);
  const info = useRaiseInfo(data);
  const seals = useRaiseSeals(data);
  const state = useRaiseState(data);
  const income = useIncomeRate(data);

  const provider = useMemo(() => getProvider(data?.service_id), [data?.service_id, getProvider]);

  const refresh = () => {
    refreshData();
    refreshPack();
  };

  return (
    <RaiseContext.Provider value={{ data, error, loading, income, info, pack, rate, seals, state, provider, refresh, getProvider }}>
      {children}
    </RaiseContext.Provider>
  );
};

export default RaiseProvider;
