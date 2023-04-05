import classNames from 'classnames';
import { useUpdateEffect } from 'ahooks';

import styles from './styles.less';
import PageHeader from '@/components/PageHeader';
import uselanContract from '@/hooks/usePlanContract';
import { ReactComponent as IncomeIcon } from './imgs/income.svg';
import { ReactComponent as WithdrawIcon } from './imgs/withdraw.svg';

export default function Account() {
  const { contract } = uselanContract();

  const fetchIncome = async () => {
    console.log(contract);
    const res = await contract?.availabelIncome();

    console.log(res);
  };

  useUpdateEffect(() => {
    fetchIncome();
  }, [contract]);

  return (
    <div className="container">
      <PageHeader title="我的账户" desc="我在FilFi中的资产概况" />

      <div className="row row-cols-1 row-cols-lg-2 g-4">
        <div className="col">
          <div className={classNames('card h-100', styles.card)}>
            <div className="card-body">
              <div className="mb-4 d-flex align-items-center justify-content-between">
                <div>
                  <IncomeIcon />

                  <span className="ms-2">总收益</span>
                </div>
              </div>

              <p className={classNames('card-text mb-0', styles.text)}>
                <span className={styles.decimal}>234.07387300</span>
                <span className="ms-1 text-gray">FIL</span>
              </p>
            </div>
          </div>
        </div>
        <div className="col">
          <div className={classNames('card h-100', styles.card)}>
            <div className="card-body">
              <div className="mb-4 d-flex align-items-center justify-content-between">
                <div>
                  <WithdrawIcon />
                  <span className="ms-2">待提取</span>
                </div>

                <div className="btn btn-light">
                  <span className="me-2">提取</span>
                  <i className="bi bi-chevron-right"></i>
                </div>
              </div>

              <p className={classNames('card-text mb-0', styles.text)}>
                <span className={styles.decimal}>60.26733</span>
                <span className="ms-1 text-gray">FIL</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
