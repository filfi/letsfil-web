import { filter } from 'lodash';
import { useMemo } from 'react';
import classNames from 'classnames';
import { useRequest } from 'ahooks';
import { Link, history, useModel } from '@umijs/max';

import * as A from '@/apis/raise';
import styles from './styles.less';
import Item from './components/Item';
import useUser from '@/hooks/useUser';
import Result from '@/components/Result';
import useAccount from '@/hooks/useAccount';
import useContract from '@/hooks/useContract';
import { isEqual, sleep } from '@/utils/utils';
import useProviders from '@/hooks/useProviders';
import useProcessify from '@/hooks/useProcessify';
import LoadingView from '@/components/LoadingView';
import useRaiseActions from '@/hooks/useRaiseActions';
import { ReactComponent as IconSearch } from './imgs/icon-search.svg';

const isArrs = function <V>(v: V | undefined): v is V {
  return Array.isArray(v) && v.length > 0;
};

export default function AccountPlans() {
  const { user } = useUser();
  const { getProvider } = useProviders();
  const [, setModel] = useModel('stepform');
  const { address, withAccount, withConnect } = useAccount();

  const service = withAccount((address) => {
    return A.investList({ address, page_size: 100 });
  });

  const { data, error, loading, refresh } = useRequest(service, { refreshDeps: [address] });
  const isEmpty = useMemo(() => !loading && (!data || data.total === 0), [data?.total, loading]);
  const lists = useMemo(() => data?.list?.all_list, [data?.list?.all_list]);
  const investIds = useMemo(() => data?.list?.invest_list, [data?.list?.invest_list]);
  const raises = useMemo(() => filter(lists, { raiser: address }), [lists, address]);
  const services = useMemo(() => filter(lists, { service_provider_address: address }), [lists, address]);
  const invests = useMemo(() => lists?.filter((item) => investIds?.some((id) => isEqual(id, item.raising_id))), [lists, investIds]);

  const handleCreate = withConnect(async () => {
    setModel(undefined);

    history.push('/create');
  });

  const handleEdit = async (data: API.Plan) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useRaiseActions(data).edit();
  };

  const handleDelete = async (data: API.Plan) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await useRaiseActions(data).remove();

    refresh();
  };

  const [, handleStart] = useProcessify(async (data: API.Plan) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await useContract(data.raise_address).startRaisePlan(data.raising_id);

    await sleep(2_000);

    refresh();
  });

  return (
    <>
      <LoadingView className="vh-50" data={data} error={!!error} loading={loading} retry={refresh}>
        {isEmpty ? (
          <Result icon={<IconSearch />} title="您还没有节点计划" desc="这里显示您的节点计划，包括您发起的节点计划和参加投资的节点计划。">
            <div className="d-flex flex-column flex-md-row justify-content-center gap-4">
              <Link className="btn btn-light" to="/raising">
                查看开放的节点计划
              </Link>
              <button className="btn btn-primary" type="button" onClick={handleCreate}>
                <span className="bi bi-plus-lg"></span>
                <span className="ms-2">发起节点计划</span>
              </button>
            </div>
          </Result>
        ) : (
          <>
            <button className="btn btn-primary float-md-end mt-lg-3" type="button" onClick={handleCreate}>
              <span className="bi bi-plus-lg"></span>
              <span className="ms-2">发起节点计划</span>
            </button>
            {isArrs(raises) && (
              <>
                <h3 className={classNames('my-4 my-lg-5', styles.title)}>我发起的节点计划</h3>
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
                <h3 className={classNames('my-4 my-lg-5', styles.title)}>我投资的节点计划</h3>
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
                <h3 className={classNames('my-4 my-lg-5', styles.title)}>{user?.name}提供技术服务的节点计划</h3>
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
