
import styles from './styles.less';
import Steps from '@/components/Steps';
import Breadcrumb from '@/components/Breadcrumb';
import PageHeader from '@/components/PageHeader';

export default function Payment() {
  const handleSubmit = () => {
  };

  return (
    <div className="container">
      <Breadcrumb items={[
        { title: '我的募集计划', route: '/market/raising' },
        { title: '新建募集计划' },
      ]} />

      <PageHeader
        title="新建募集计划"
      >
        <button className="btn btn-light" type="button">
          <i className="bi bi-x-circle"></i>
          <span className="ms-1">退出</span>
        </button>
      </PageHeader>

      <div className="position-relative">
        <div className="position-absolute">
          <Steps current={4} />
        </div>
        <div className={styles.form}>
        </div>
      </div>
    </div>
  );
}
