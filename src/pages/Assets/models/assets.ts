import { useMemo, useState } from 'react';

import useAssetData from '@/hooks/useAssetsData';
import useAssetPack from '@/hooks/useAssetPack';
import useRelease from '../hooks/useRelease';
import useLoanList from '../hooks/useLoanList';
import useRaiseState from '@/hooks/useRaiseState';

export default function useAssetsAssets() {
  const [id, setId] = useState('');

  const { pack, plan, isError, isLoading: loading, refetch: refresh } = useAssetData(id);

  const state = useRaiseState(plan);
  const assets = useAssetPack(plan, pack);
  const loanList = useLoanList(plan);
  const release = useRelease(plan?.raise_address, pack?.raising_id);

  const isLoading = useMemo(
    () => loading || assets.isLoading || loanList.isLoading || release.isLoading || state.isLoading,
    [loading, assets.isLoading, loanList.isLoading, release.isLoading, state.isLoading],
  );

  const run = async (id: string) => {
    setId(id);
  };

  const refetch = async () => {
    refresh();
    assets.refetch();
    state.refetch();
    loanList.refetch();
    release.refresh();
  };

  return {
    pack,
    plan,
    state,
    assets,
    release,
    loanList,
    isError,
    isLoading,
    refetch,
    run,
  };
}
