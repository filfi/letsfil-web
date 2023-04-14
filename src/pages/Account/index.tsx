import { Skeleton } from 'antd';
import classNames from 'classnames';
import { useMemo, useState } from 'react';
import { useRequest, useUpdateEffect } from 'ahooks';

import styles from './styles.less';
import { accAdd } from '@/utils/utils';
import { getPlansByAddr } from '@/apis/raise';
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

  const fetchTotalIncome = async () => {
    if (!accounts[0] || !data || !data.length) return;

    const rewards = await Promise.all(
      data.map(async (item) => {
        const contract = getContract(item.raise_address);

        return await contract?.totalRewardOf(accounts[0]);
      }),
    );

    const sum = rewards.reduce((sum, curr) => accAdd(sum, toNumber(curr)), 0);

    console.log('[rewards]: ', rewards);
    console.log('[total]: ', sum);

    setTotal(sum);
  };

  const fetchUsableIncome = async () => {
    if (!accounts[0] || !data || !data.length) return;

    const rewards = await Promise.all(
      data.map(async (item) => {
        const contract = getContract(item.raise_address);

        return await contract?.availableRewardOf(accounts[0]);
      }),
    );

    const sum = rewards.reduce((sum, curr) => accAdd(sum, toNumber(curr)), 0);

    console.log('[available rewards]: ', rewards);
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
                  <div>
                    <IncomeIcon />

                    <span className="ms-2">总收益</span>
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
                  <div>
                    <WithdrawIcon />
                    <span className="ms-2">待提取</span>
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
