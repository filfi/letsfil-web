import { useMemo } from 'react';
import { useTitle } from 'ahooks';
import { Outlet, useLocation } from '@umijs/max';

// import Modal from '@/components/Modal';
import Steps from '@/components/Steps';
import PageHeader from '@/components/PageHeader';

const paths = ['storage', 'program', 'benefit', 'result'];
const items = [{ title: '客製化儲存方案' }, { title: '填寫質押目標' }, { title: '設計分配方案' }, { title: '完成' }];

export default function Create() {
  useTitle('發起節點計劃 - FilFi', { restoreOnUnmount: true });

  const location = useLocation();
  const current = useMemo(() => paths.findIndex((path) => location.pathname.includes(path)), [location.pathname]);

  return (
    <>
      <div className="container pb-4 pb-lg-5">
        <PageHeader
          title="新建節點計劃"
          desc={
            <>
              <span>依靠強大的FVM智能合約，合作共建Filecoin儲存。</span>
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

      {/* <Modal.Alert id="create-tips" title="新建節點計劃" confirmText="我知道了">
        <div className="card border-0">
          <div className="card-body">
            <p className="mb-0">依靠強大的FVM智能合約，合作共建Filecoin儲存。</p>
          </div>
        </div>
      </Modal.Alert> */}
    </>
  );
}
