import { useMemo } from 'react';
import classNames from 'classnames';
import { useDebounceEffect } from 'ahooks';
import { useQuery } from '@tanstack/react-query';
import { /* Link, */ history, useModel } from '@umijs/max';

import * as A from '@/apis/raise';
import styles from './styles.less';
import Item from './components/Item';
import useUser from '@/hooks/useUser';
import Result from '@/components/Result';
import { withNull } from '@/utils/hackify';
import useAccount from '@/hooks/useAccount';
import useContract from '@/hooks/useContract';
import { isMountPlan } from '@/helpers/mount';
import { isEqual, sleep } from '@/utils/utils';
import useProcessify from '@/hooks/useProcessify';
import LoadingView from '@/components/LoadingView';
import useRaiseActions from '@/hooks/useRaiseActions';
import { ReactComponent as IconSearch } from './imgs/icon-search.svg';

const isArrs = function <V>(v: V | undefined): v is V {
  return Array.isArray(v) && v.length > 0;
};

export default function AccountPlans() {
  const { user } = useUser();
  const contract = useContract();
  const actions = useRaiseActions();
  const [, setModel] = useModel('stepform');
  const { address, withAccount, withConnect } = useAccount();

  const service = withAccount((address) => {
    return A.investList({ address, page_size: 100 });
  });

  const { data, error, isLoading, refetch } = useQuery(['investList', address], withNull(service));
  const isEmpty = useMemo(() => !isLoading && (!data || data.total === 0), [data, isLoading]);
  const lists = useMemo(() => data?.list?.all_list, [data?.list?.all_list]);
  const investors = useMemo(() => data?.list?.invest_list, [data?.list?.invest_list]);
  const raises = useMemo(() => lists?.filter((item) => isEqual(item.raiser, address)), [lists, address]);
  const services = useMemo(() => lists?.filter((item) => isEqual(item.service_provider_address, address)), [lists, address]);
  const invests = useMemo(() => lists?.filter((item) => investors?.some((id) => isEqual(id, item.raising_id))), [lists, investors]);

  useDebounceEffect(
    () => {
      address && refetch();
    },
    [address],
    { wait: 200 },
  );

  const handleCreate = withConnect(async (planType: number = 1) => {
    setModel(undefined);

    history.push(isMountPlan({ plan_type: planType }) ? '/mount' : '/create');
  });

  const handleEdit = async (data: API.Plan) => {
    actions.edit(data);
  };

  const handleDelete = async (data: API.Plan) => {
    await actions.remove(data.raising_id);

    refetch();
  };

  const [, handleStart] = useProcessify(async (data: API.Plan) => {
    await contract.startRaisePlan(data.raising_id, { address: data.raise_address });

    await sleep(2_000);

    refetch();
  });

  return (
    <>
      <LoadingView className="vh-50" data={data} error={!!error} loading={isLoading} retry={refetch}>
        {isEmpty ? (
          <Result icon={<IconSearch />} title="您还没有节点计划" desc="这里显示您的节点计划，包括您发起的节点计划和参与的节点计划。">
            <div className="d-flex flex-column flex-md-row justify-content-center gap-4">
              {/* <Link className="btn btn-light" to="/raising">
                查看开放的节点计划
              </Link> */}
              <button className="btn btn-light" type="button" onClick={() => handleCreate(2)}>
                <span className="bi bi-hdd-stack"></span>
                <span className="ms-2">挂载历史节点</span>
              </button>
              <button className="btn btn-primary" type="button" onClick={() => handleCreate()}>
                <span className="bi bi-plus-lg"></span>
                <span className="ms-2">发起节点计划</span>
              </button>
            </div>
          </Result>
        ) : (
          <>
            <p className="hstack flex-wrap gap-3 float-lg-end mt-lg-3 text-end">
              <button className="btn btn-light" type="button" onClick={() => handleCreate(2)}>
                <span className="bi bi-hdd-stack"></span>
                <span className="ms-2">挂载历史节点</span>
              </button>
              <button className="btn btn-primary" type="button" onClick={() => handleCreate()}>
                <span className="bi bi-plus-lg"></span>
                <span className="ms-2">发起节点计划</span>
              </button>
            </p>

            {isArrs(raises) && (
              <>
                <h3 className={classNames('my-4 my-lg-5', styles.title)}>我发起的节点计划</h3>
                <div className="row row-cols-1 row-cols-lg-2 g-3 g-lg-4 mb-3 mb-lg-4">
                  {raises.map((item) => (
                    <div className="col" key={item.raising_id}>
                      <Item
                        data={item}
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
                <h3 className={classNames('my-4 my-lg-5', styles.title)}>我参与的节点计划</h3>
                <div className="row row-cols-1 row-cols-lg-2 g-3 g-lg-4 mb-3 mb-lg-4">
                  {invests.map((item) => (
                    <div className="col" key={item.raising_id}>
                      <Item
                        invest
                        data={item}
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
