import { createContext } from 'react';

import useAssetPack from '@/hooks/useAssetPack';
import useRaiseInfo from '@/hooks/useRaiseInfo';
import useRaiseRate from '@/hooks/useRaiseRate';
import useRaiseRole from '@/hooks/useRaiseRole';
import useIncomeRate from '@/hooks/useIncomeRate';
import useRaiseSeals from '@/hooks/useRaiseSeals';
import useRaiseState from '@/hooks/useRaiseState';

export type RaiseContextValue = {
  error?: Error;
  data?: API.Plan;
  info: ReturnType<typeof useRaiseInfo>;
  rate: ReturnType<typeof useRaiseRate>;
  role: ReturnType<typeof useRaiseRole>;
  seals: ReturnType<typeof useRaiseSeals>;
  asset: ReturnType<typeof useAssetPack>;
  state: ReturnType<typeof useRaiseState>;
  income: ReturnType<typeof useIncomeRate>;
  provider?: API.Provider;
  loading: boolean;
  refresh: () => void;
  getProvider: (id: number | string) => API.Provider | undefined;
};

export const RaiseContext = createContext<RaiseContextValue>({} as any);
