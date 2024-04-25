import { useMemo, useState } from 'react';

import useAssetsData from '@/hooks/useAssetsData';
import useAssetPack from '@/hooks/useAssetPack';
import useRaiseBase from '@/hooks/useRaiseBase';
import useRaiseRate from '@/hooks/useRaiseRate';
import useRaiseRole from '@/hooks/useRaiseRole';
import useRaiseState from '@/hooks/useRaiseState';

export default function useOverviewModel() {
  const [id, setId] = useState('');

  const { pack, plan, isError, isLoading: loading, refetch: refresh } = useAssetsData(id);
  const assets = useAssetPack(plan, pack);
  const base = useRaiseBase(plan);
  const rate = useRaiseRate(plan);
  const role = useRaiseRole(plan);
  const state = useRaiseState(plan);

  const isLoading = useMemo(
    () => loading || assets.isLoading || base.isLoading || state.isLoading,
    [loading, assets.isLoading, base.isLoading, state.isLoading],
  );

  const run = (id: string) => {
    setId(id);
  };

  const refetch = async () => {
    refresh();
    assets.refetch();
    base.refetch();
    state.refetch();
  };

  return {
    base,
    pack,
    plan,
    rate,
    role,
    state,
    assets,
    isError,
    isLoading,
    run,
    refetch,
  };
}
