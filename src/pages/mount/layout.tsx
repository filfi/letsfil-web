import { useMemo } from 'react';
import { useTitle } from 'ahooks';
import { Outlet, useLocation } from '@umijs/max';

import Steps from '@/components/Steps';
import PageHeader from '@/components/PageHeader';

const paths = ['node', 'benefit', 'result'];
const items = [{ title: '指定历史节点' }, { title: '填写分配方案' }, { title: '完成', path: 'result' }];

export default function MountLayout() {
  useTitle('挂载历史节点 - FilFi', { restoreOnUnmount: true });

  const location = useLocation();
  const current = useMemo(() => paths.findIndex((path) => location.pathname.includes(path)), [location.pathname]);

  return (
    <>
      <div className="container pb-4 pb-lg-5">
        <PageHeader
          title="新建分配计划"
          desc={
            <>
              <span>将历史节点挂载到FilFi网络，委托智能合约分配激励</span>
              {/* <a className="text-underline" href="#create-tips" data-bs-toggle="modal">
                了解更多
              </a> */}
            </>
          }
        />

        <Steps direction="horizontal" current={current} items={items} size="large" />

        <div className="border-top my-4" />

        <Outlet />
      </div>

      {/* <Modal.Alert id="create-tips" title="新建节点计划" confirmText="我知道了">
        <div className="card border-0">
          <div className="card-body">
            <p className="mb-0">依靠强大的FVM智能合约，合作共建Filecoin存储。</p>
          </div>
        </div>
      </Modal.Alert> */}
    </>
  );
}
