import { useMemo } from 'react';
import classNames from 'classnames';
import { useRequest } from 'ahooks';
import { camelCase, filter } from 'lodash';
import { Link, history, useModel } from '@umijs/max';

import * as A from '@/apis/raise';
import styles from './styles.less';
import Item from './components/Item';
import useUser from '@/hooks/useUser';
import Dialog from '@/components/Dialog';
import Result from '@/components/Result';
import { catchify } from '@/utils/hackify';
import useAccounts from '@/hooks/useAccounts';
import useProvider from '@/hooks/useProvider';
import { transformModel } from '@/helpers/app';
import { isEqual, sleep } from '@/utils/utils';
import useProcessify from '@/hooks/useProcessify';
import LoadingView from '@/components/LoadingView';
import useRaiseContract from '@/hooks/useRaiseContract';
import { ReactComponent as IconSearch } from './imgs/icon-search.svg';

const isArrs = function <V>(v: V | undefined): v is V {
  return Array.isArray(v) && v.length > 0;
};

export default function AccountPlans() {
  const { user } = useUser();
  const { getProvider } = useProvider();
  const [, setModel] = useModel('stepform');
  const { getContract } = useRaiseContract();
  const { account, withAccount } = useAccounts();

  const service = withAccount(async (address) => {
    if (address) {
      return await A.investList({ address, page_size: 100 });
    }
  });

  const { data, error, loading, refresh } = useRequest(service, { refreshDeps: [account] });
  const isEmpty = useMemo(() => !loading && (!data || data.total === 0), [data?.total, loading]);
  const lists = useMemo(() => data?.list?.all_list, [data?.list?.all_list]);
  const investIds = useMemo(() => data?.list?.invest_list, [data?.list.invest_list]);
  const raises = useMemo(() => filter(lists, { raiser: account }), [lists, account]);
  const services = useMemo(() => filter(lists, { service_provider_address: account }), [lists, account]);
  const invests = useMemo(() => lists?.filter((item) => investIds?.some((id) => isEqual(id, item.raising_id))), [lists, investIds]);

  const handleCreate = () => {
    setModel(undefined);

    history.push('/create');
  };

  const handleEdit = (data: API.Plan) => {
    const model = Object.keys(data).reduce(
      (d, key) => ({
        ...d,
        [camelCase(key)]: data[key as keyof typeof data],
      }),
      {},
    );

    setModel(transformModel(model));

    history.push('/create');
  };

  const handleDelete = async (data: API.Plan) => {
    const [e] = await catchify(A.del)(data.raising_id);

    if (e) {
      await sleep(500);
      Dialog.alert({
        icon: 'error',
        title: '操作失败',
        content: e.message,
      });
      return;
    }

    refresh();
  };

  const [, handleStart] = useProcessify(async (data: API.Plan) => {
    const contract = getContract(data.raise_address);

    await contract?.startRaisePlan(data.raising_id);

    refresh();
  });

  return (
    <>
      <LoadingView data={data} error={!!error} loading={loading} retry={refresh}>
        {isEmpty ? (
          <Result icon={<IconSearch />} title="您还没有募集计划" desc="这里显示您的募集计划，包括您发起的募集计划和参加投资的募集计划。">
            <div className="d-flex flex-column flex-md-row justify-content-center gap-4">
              <Link className="btn btn-light" to="/raising">
                查看开放的募集计划
              </Link>
              <button className="btn btn-primary" type="button" onClick={handleCreate}>
                <span className="bi bi-plus-lg"></span>
                <span className="ms-2">发起募集计划</span>
              </button>
            </div>
          </Result>
        ) : (
          <>
            <button className="btn btn-primary float-md-end mt-lg-3" type="button" onClick={handleCreate}>
              <span className="bi bi-plus-lg"></span>
              <span className="ms-2">发起募集计划</span>
            </button>
            {isArrs(raises) && (
              <>
                <h3 className={classNames('my-4 my-lg-5', styles.title)}>我发起的募集计划</h3>
                <div className="row row-cols-1 row-cols-lg-2 g-3 g-lg-4 mb-3 mb-lg-4">
                  {raises.map((item) => (
                    <div className="col" key={item.raising_id}>
                      <Item
                        data={item}
                        getProvider={getProvider}
                        onEdit={() => handleEdit(item)}
                        onHide={() => handleDelete(item)}
                        onDelete={() => handleDelete(item)}
                        onStart={() => handleStart(item)}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {isArrs(invests) && (
              <>
                <h3 className={classNames('my-4 my-lg-5', styles.title)}>我投资的募集计划</h3>
                <div className="row row-cols-1 row-cols-lg-2 g-3 g-lg-4 mb-3 mb-lg-4">
                  {invests.map((item) => (
                    <div className="col" key={item.raising_id}>
                      <Item
                        invest
                        data={item}
                        getProvider={getProvider}
                        onEdit={() => handleEdit(item)}
                        onHide={() => handleDelete(item)}
                        onDelete={() => handleDelete(item)}
                        onStart={() => handleStart(item)}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}

            {isArrs(services) && (
              <>
                <h3 className={classNames('my-4 my-lg-5', styles.title)}>{user?.name}提供技术服务的募集计划</h3>
                <div className="row row-cols-1 row-cols-lg-2 g-3 g-lg-4 mb-3 mb-lg-4">
                  {services.map((item) => (
                    <div className="col" key={item.raising_id}>
                      <Item
                        data={item}
                        getProvider={getProvider}
                        onEdit={() => handleEdit(item)}
                        onHide={() => handleDelete(item)}
                        onDelete={() => handleDelete(item)}
                        onStart={() => handleStart(item)}
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </LoadingView>
    </>
  );
}
