import { useMemo } from 'react';
import { useTitle } from 'ahooks';
import { Outlet, useLocation } from '@umijs/max';

import Steps from '@/components/Steps';
import PageHeader from '@/components/PageHeader';

const paths = ['node', 'benefit', 'result'];
const items = [{ title: '指定歷史節點' }, { title: '填寫分配方案' }, { title: '完成', path: 'result' }];

export default function MountLayout() {
  useTitle('掛載歷史節點 - FilFi', { restoreOnUnmount: true });

  const location = useLocation();
  const current = useMemo(() => paths.findIndex((path) => location.pathname.includes(path)), [location.pathname]);

  return (
    <>
      <div className="container pb-4 pb-lg-5">
        <PageHeader
          title="掛載歷史節點"
          desc={
            <>
              <span>將歷史節點掛載到FilFi網絡，委託智能合約分配激勵</span>
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

      {/* <Modal.Alert id="create-tips" title="掛載歷史節點" confirmText="我知道了">
        <div className="card border-0">
          <div className="card-body">
            <p className="mb-0">將歷史節點掛載到FilFi網絡，委託智能合約分配激勵</p>
          </div>
        </div>
      </Modal.Alert> */}
    </>
  );
}
