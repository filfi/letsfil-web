import { useTitle } from 'ahooks';
import classNames from 'classnames';
import { FormattedMessage, history, useModel } from '@umijs/max';

import bg from './imgs/bg.png';
import styles from './styles.less';
import usePageMeta from '@/hooks/usePageMeta';
import useAuthHandler from '@/hooks/useAuthHandler';

export default function Home() {
  useTitle("首页 - Let's Fil", { restoreOnUnmount: true });
  usePageMeta({
    bodyStyle: {
      backgroundImage: `url(${bg})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center 34px',
    },
  });

  const { setUser } = useModel('user');

  const go = useAuthHandler(async (role: User['role']) => {
    setUser({ role });

    history.push('/letsfil/raising');
  });

  return (
    <>
      <div className={classNames('container text-center', styles.container)}>
        <div className={styles.hero}>
          <h2 className={styles.title}>
            <FormattedMessage id="pages.home.hero.title" />
          </h2>
        </div>

        <h4 className="mb-4 fw-normal">
          <FormattedMessage id="pages.home.hero.desc" />
        </h4>

        <div className="row row-cols-1 row-cols-md-2 g-3 g-lg-4 py-4">
          <div className="col text-center">
            <div className="card flex-fill border-0 rounded-3 text-reset" style={{ backgroundColor: '#E6EEFA' }}>
              <div className="card-body py-4">
                <h4 className="card-title mb-3 fw-bold">
                  <FormattedMessage id="pages.home.raiser.title" />
                </h4>
                <p className={classNames('mb-0 d-grid', styles.btn)}>
                  <button className="btn btn-dark btn-lg rounded-pill" type="button" onClick={() => go('raiser')}>
                    <span className="me-2">
                      <FormattedMessage id="pages.home.raiser.btn" />
                    </span>
                    <span className="bi bi-arrow-right"></span>
                  </button>
                </p>
              </div>
            </div>
          </div>
          <div className="col text-center">
            <div className="card flex-fill border-0 rounded-3 text-reset" style={{ backgroundColor: '#E5F5D0' }}>
              <div className="card-body py-4">
                <h4 className="card-title mb-3 fw-bold">
                  <FormattedMessage id="pages.home.invest.title" />
                </h4>
                <p className={classNames('mb-0 d-grid', styles.btn)}>
                  <button className="btn btn-dark btn-lg rounded-pill" type="button" onClick={() => go('investor')}>
                    <span className="me-2">
                      <FormattedMessage id="pages.home.invest.btn" />
                    </span>
                    <span className="bi bi-arrow-right"></span>
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
