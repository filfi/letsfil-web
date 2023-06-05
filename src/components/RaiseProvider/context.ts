import { createContext } from 'react';

import useRaiseInfo from '@/hooks/useRaiseInfo';
import useRaiseRate from '@/hooks/useRaiseRate';
import useIncomeRate from '@/hooks/useIncomeRate';
import useRaiseSeals from '@/hooks/useRaiseSeals';
import useRaiseState from '@/hooks/useRaiseState';

export type RaiseContextValue = {
  error?: Error;
  data?: API.Plan;
  pack?: API.AssetPack;
  rate: ReturnType<typeof useRaiseRate>;
  info: ReturnType<typeof useRaiseInfo>;
  seals: ReturnType<typeof useRaiseSeals>;
  state: ReturnType<typeof useRaiseState>;
  income: ReturnType<typeof useIncomeRate>;
  provider?: API.Provider;
  loading: boolean;
  refresh: () => void;
  getProvider: (id: number | string) => API.Provider | undefined;
};

export const RaiseContext = createContext<RaiseContextValue>({} as any);
