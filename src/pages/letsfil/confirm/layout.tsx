import { history, Outlet, useModel } from '@umijs/max';

import Modal from '@/components/Modal';
import PageHeader from '@/components/PageHeader';

export default function ConfirmLayout() {
  const [, setData] = useModel('stepform');

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
      <PageHeader title="确认募集计划">
        <button className="btn btn-light" type="button" onClick={handleClear}>
          <i className="bi bi-x-circle"></i>
          <span className="ms-1">退出</span>
        </button>
      </PageHeader>

      <Outlet />
    </div>
  );
}
