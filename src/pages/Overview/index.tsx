import classNames from 'classnames';
import { ScrollSpy } from 'bootstrap';
import { useParams } from '@umijs/max';
import { useDebounceEffect } from 'ahooks';

import styles from './styles.less';
import ContNav from './components/ContNav';
import ContMain from './components/ContMain';
import ContSider from './components/ContSider';
import ContHeader from './components/ContHeader';
import useRaiseInfo from '@/hooks/useRaiseInfo';
import LoadingView from '@/components/LoadingView';

function updateScrollSpy() {
  const el = document.querySelector('[data-bs-spy="scroll"]');

  if (el) {
    const spy = ScrollSpy.getOrCreateInstance(el);

    spy.refresh();
  }
}

export default function Overview() {
  const param = useParams();
  const { data, error, isLoading, refetch } = useRaiseInfo(param.id);

  useDebounceEffect(updateScrollSpy, [data], { wait: 300 });

  return (
    <>
      <div className="container">
        <LoadingView data={data} error={!!error} loading={isLoading} retry={refetch}>
          <ContHeader data={data} />

          <div className={classNames('d-flex flex-column flex-lg-row', styles.content)}>
            <div id="nav-pills" className={classNames('d-none d-lg-block flex-shrink-0', styles.tabs)}>
              <ContNav data={data} />
            </div>
            <div
              className={classNames('d-flex flex-column flex-grow-1', styles.main)}
              tabIndex={0}
              data-bs-spy="scroll"
              data-bs-target="#nav-pills"
              data-bs-smooth-scroll="true"
              data-bs-root-margin="0px 0px -80%"
            >
              <ContMain data={data} />
            </div>
            <div className={classNames('flex-shrink-0', styles.sidebar)}>
              <ContSider data={data} />
            </div>
          </div>
        </LoadingView>
      </div>

      {/* <Calculator /> */}

      <p>
        <br />
      </p>
    </>
  );
}
