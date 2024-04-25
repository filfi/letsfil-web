import { useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';

import * as M from '@/helpers/mount';
import * as R from '@/helpers/raise';
import { accAdd } from '@/utils/utils';
import { withNull } from '@/utils/hackify';
import useAccount from '@/hooks/useAccount';
import useContract from '@/hooks/useContract';
import useRetrieverContract from '@/hooks/useRetrieverContract';

type ListType = [string[], number[], number[]];

export default function useLoanList(plan?: API.Plan | null) {
  const { address } = useAccount();
  const C = useContract(plan?.raise_address);
  const contract = useRetrieverContract();

  const getProgressEnd = async () => {
    if (plan && !M.isMountPlan(plan) && !R.isPending(plan)) {
      return await C.getProgressEnd(plan.raising_id);
    }
  };

  const getLoanedList = async () => {
    if (address && plan?.raising_id) {
      return await contract.getLoanedList(plan.raising_id, address);
    }
  };

  const getUnpaidLoan = async () => {
    if (address && plan?.raising_id) {
      return await contract.getUnpaidLoan(plan.raising_id, address);
    }
  };

  const [eRes, lRes, uRes] = useQueries({
    queries: [
      {
        queryFn: withNull(getProgressEnd),
        queryKey: ['getProgressEnd', plan?.raising_id],
      },
      {
        queryFn: withNull(getLoanedList),
        queryKey: ['getLoanedList', plan?.raising_id, address],
      },
      {
        queryFn: withNull(getUnpaidLoan),
        queryKey: ['getUnpaidLoan', plan?.raising_id, address],
      },
    ],
  });

  const list = useMemo(() => lRes.data ?? ([[], [], []] as ListType), [lRes.data]);
  const unpaid = useMemo(() => uRes.data ?? 0, [uRes.data]);
  const isProcessed = useMemo(() => eRes.data, [eRes.data]);
  const collateral = useMemo(() => list[1].reduce((sum, curr) => accAdd(sum, curr), 0), [list]);
  // const period = useMemo(() => accMul(unpaid, accMul(accDiv(pool.loanRate, 365), 7)), [pool.loanRate, unpaid]);
  const isLoan = useMemo(() => (M.isMountPlan(plan) ? M.isWorking(plan) : isProcessed), [plan, isProcessed]);

  const isError = useMemo(() => lRes.isError || uRes.isError, [lRes.isError, uRes.isError]);
  const isLoading = useMemo(() => lRes.isLoading || uRes.isLoading, [lRes.isLoading, uRes.isLoading]);

  const refetch = async () => {
    return await Promise.all([eRes.refetch(), lRes.refetch(), uRes.refetch()]);
  };

  return {
    list,
    unpaid,
    collateral,
    isLoan,
    isProcessed,
    isError,
    isLoading,
    refetch,
  };
}
