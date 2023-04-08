import { useMemo } from 'react';
import { history, Outlet, useLocation, useModel } from '@umijs/max';

import Modal from '@/components/Modal';
import Steps from '@/components/Steps';
import Breadcrumb from '@/components/Breadcrumb';
import PageHeader from '@/components/PageHeader';

const items = [{ title: '计划方案' }, { title: '分配方案' }, { title: '建设方案' }, { title: '确认信息' }, { title: '支付保证金' }];

export default function Create() {
  const location = useLocation();
  const [, setData] = useModel('stepform');

  const current = useMemo(
    () => ['program', 'allocation', 'build', 'confirm', 'payment'].findIndex((path) => location.pathname.includes(path)),
    [location.pathname],
  );

  const handleClear = () => {
    Modal.confirm({
      title: '确定退出吗？',
      content: '此时退出将不会保存已填写信息',
      cancelText: '留在本页',
      confirmText: '确定退出',
      onConfirm: () => {
        setData(undefined);

        history.replace('/letsfil');
      },
    });
  };

  return (
    <div className="container">
      <Breadcrumb items={[{ title: '我的募集计划', route: '/letsfil/raising' }, { title: '新建募集计划' }]} />

      <PageHeader title="新建募集计划">
        <button className="btn btn-light" type="button" onClick={handleClear}>
          <i className="bi bi-x-circle"></i>
          <span className="ms-1">退出</span>
        </button>
      </PageHeader>

      <div className="clearfix">
        <div className="float-start d-none d-lg-block">
          <Steps className="letsfil-steps" current={current} items={items} />
        </div>
        <div className="letsfil-form">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
