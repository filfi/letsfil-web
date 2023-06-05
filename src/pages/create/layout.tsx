import { useMemo } from 'react';
import { useTitle } from 'ahooks';
import { Outlet, useLocation } from '@umijs/max';

// import Modal from '@/components/Modal';
import Steps from '@/components/Steps';
import PageHeader from '@/components/PageHeader';

const items = [{ title: '定制存储方案' }, { title: '填写募集目标' }, { title: '设计分配方案' }, { title: '完成' }];

export default function Create() {
  useTitle('发起募集计划 - FilFi', { restoreOnUnmount: true });

  const location = useLocation();
  const current = useMemo(() => ['storage', 'program', 'benefit', 'result'].findIndex((path) => location.pathname.includes(path)), [location.pathname]);

  return (
    <>
      <div className="container pb-4 pb-lg-5">
        <PageHeader
          title="新建募集计划"
          desc={
            <>
              <span>依靠强大的FVM智能合约，合作共建Filecoin存储。</span>
              {/* <a className="text-underline" href="#create-tips" data-bs-toggle="modal">
                了解更多
              </a> */}
            </>
          }
        ></PageHeader>

        <Steps direction="horizontal" current={current} items={items} size="large" />

        <div className="border-top my-4" />

        <Outlet />
      </div>

      {/* <Modal.Alert id="create-tips" title="新建募集计划" confirmText="我知道了">
        <div className="card border-0">
          <div className="card-body">
            <p className="mb-0">依靠强大的FVM智能合约，合作共建Filecoin存储。</p>
          </div>
        </div>
      </Modal.Alert> */}
    </>
  );
}
