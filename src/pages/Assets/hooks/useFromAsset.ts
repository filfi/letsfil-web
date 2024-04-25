import { useMemo } from 'react';

import usePackInfo from '@/hooks/usePackInfo';
import useRaiseInfo from '@/hooks/useRaiseInfo';
import useAssetPack from '@/hooks/useAssetPack';

export default function useFromAsset(from?: string) {
  const { data: pack, isLoading: packLoading, refetch: packRefresh } = usePackInfo(from);
  const { data: plan, isLoading: planLoading, refetch: planRefresh } = useRaiseInfo(from);

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    refetch: assetRefetch,
    isLoading: assetLoading,
    ...assets
  } = useAssetPack(plan, pack);

  const isLoading = useMemo(() => assetLoading || packLoading || planLoading, [assetLoading, packLoading, planLoading]);

  const refetch = async () => {
    packRefresh();
    planRefresh();
  };

  return {
    ...assets,
    pack,
    plan,
    isLoading,
    refetch,
  };
}
