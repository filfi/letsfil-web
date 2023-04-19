import { Skeleton } from 'antd';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { useRequest, useUpdateEffect } from 'ahooks';

import styles from './styles.less';
import { getPlansByAddr } from '@/apis/raise';
import { accAdd, isEqual } from '@/utils/utils';
import useAccounts from '@/hooks/useAccounts';
import PageHeader from '@/components/PageHeader';
import usePlanContract from '@/hooks/usePlanContract';
import { formatAmount, toNumber } from '@/utils/format';
import { ReactComponent as IncomeIcon } from './imgs/income.svg';
import { ReactComponent as WithdrawIcon } from './imgs/withdraw.svg';

export default function Account() {
  const { accounts } = useAccounts();

  const [total, setTotal] = useState(0);
  const [usable, setUsable] = useState(0);

  const { getContract } = usePlanContract();

  const account = useMemo(() => accounts[0], [accounts]);

  const service = async () => {
    if (account) {
      const res = await getPlansByAddr(account);

      return res.list;
    }

    return undefined;
  };

  const { data, loading } = useRequest(service, { refreshDeps: [account] });

  const getServicerReward = async (address: string) => {
    const contract = getContract(address);
    const raiseInfo = await contract?.raiseInfo();

    if (isEqual(accounts[0], raiseInfo?.spAddress)) {
      const used = await contract?.gotSpReward();
      const usable = await contract?.spRewardAvailableLeft();
      const pending = await contract?.spWillReleaseReward();

      return accAdd(accAdd(toNumber(used), toNumber(usable)), toNumber(pending));
    }

    return 0;
  };

  const getRaiserReward = async (address: string) => {
    const contract = getContract(address);
    const raiseInfo = await contract?.raiseInfo();

    if (isEqual(accounts[0], raiseInfo?.sponsor)) {
      const used = await contract?.gotRaiserReward();
      const usable = await contract?.raiserRewardAvailableLeft();
      const pending = await contract?.raiserWillReleaseReward();
      return accAdd(accAdd(toNumber(used), toNumber(usable)), toNumber(pending));
    }

    return 0;
  };

  const getTotalReward = async (address: string) => {
    const contract = getContract(address);
    const raiser = await getRaiserReward(address);
    const servicer = await getServicerReward(address);
    const total = await contract?.totalRewardOf(accounts[0]);

    return accAdd(accAdd(raiser, servicer), toNumber(total));
  };

  const getUsableReward = async (address: string) => {
    const contract = getContract(address);
    const invest = await contract?.availableRewardOf(accounts[0]);

    let raiser = 0;
    let servicer = 0;

    const raiseInfo = await contract?.raiseInfo();
    if (isEqual(accounts[0], raiseInfo?.sponsor)) {
      raiser = await contract?.raiserRewardAvailableLeft();
    }
    if (isEqual(accounts[0], raiseInfo?.spAddress)) {
      servicer = await contract?.spRewardAvailableLeft();
    }

    return accAdd(accAdd(toNumber(raiser), toNumber(servicer)), toNumber(invest));
  };

  const fetchSum = async (handle: typeof getTotalReward) => {
    if (!accounts[0] || !data || !data.length) return 0;

    const rewards = await Promise.all(data.map((item) => handle(item.raise_address)));

    return rewards.reduce((sum, curr) => accAdd(sum, curr), 0);
  };

  const fetchTotalIncome = async () => {
    const sum = await fetchSum(getTotalReward);

    console.log('[total]: ', sum);

    setTotal(sum);
  };

  const fetchUsableIncome = async () => {
    const sum = await fetchSum(getUsableReward);

    console.log('[total available]: ', sum);

    setUsable(sum);
  };

  useUpdateEffect(() => {
    fetchTotalIncome();
    fetchUsableIncome();
  }, [data, accounts]);

  return (
    <div className="container">
      <PageHeader title="我的账户" desc="我在FilFi中的资产概况" />

      <div className="row row-cols-1 row-cols-lg-2 g-4">
        <div className="col">
          <div className={classNames('card h-100', styles.card)}>
            <Skeleton active loading={loading}>
              <div className="card-body">
                <div className="mb-4 d-flex align-items-center justify-content-between">
                  <div className="flex-shrink-0">
                    <IncomeIcon />
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h5 className="card-title mb-0">总收益</h5>
                  </div>
                </div>

                <p className={classNames('card-text mb-0', styles.text)}>
                  <span className={styles.decimal}>{formatAmount(total)}</span>
                  <span className="ms-1 text-gray">FIL</span>
                </p>
              </div>
            </Skeleton>
          </div>
        </div>
        <div className="col">
          <div className={classNames('card h-100', styles.card)}>
            <Skeleton active loading={loading}>
              <div className="card-body">
                <div className="mb-4 d-flex align-items-center justify-content-between">
                  <div className="flex-shrink-0">
                    <WithdrawIcon />
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <h5 className="card-title mb-1">待提取收益</h5>
                    <p className="card-text mb-0 text-gray-dark">请到参与的各计划中分别提取</p>
                  </div>
                </div>

                <p className={classNames('card-text mb-0', styles.text)}>
                  <span className={styles.decimal}>{formatAmount(usable)}</span>
                  <span className="ms-1 text-gray">FIL</span>
                </p>
              </div>
            </Skeleton>
          </div>
        </div>
      </div>
    </div>
  );
}
