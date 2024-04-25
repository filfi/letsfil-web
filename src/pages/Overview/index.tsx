import classNames from 'classnames';
import { ScrollSpy } from 'bootstrap';
import { useDebounceEffect } from 'ahooks';
import { useLayoutEffect, useMemo } from 'react';
import { useModel, useParams } from '@umijs/max';

import styles from './styles.less';
import { isMountPlan } from '@/helpers/mount';
import LoadingView from '@/components/LoadingView';
import AssetsHeader from '@/components/AssetsHeader';
import MountNav from './components/MountNav';
import MountMain from './components/MountMain';
import MountSider from './components/MountSider';
import RaiseNav from './components/RaiseNav';
import RaiseMain from './components/RaiseMain';
import RaiseSider from './components/RaiseSider';
import RaiseActions from './components/RaiseActions';

function updateScrollSpy() {
  const el = document.querySelector('[data-bs-spy="scroll"]');

  if (el) {
    const spy = ScrollSpy.getOrCreateInstance(el);

    spy.refresh();
  }
}

export default function Overview() {
  const params = useParams();

  const { plan, isError, isLoading, refetch, run } = useModel('Overview.overview');

  const mountPlan = useMemo(() => isMountPlan(plan), [plan]);

  useDebounceEffect(updateScrollSpy, [plan], { wait: 300 });

  useLayoutEffect(() => {
    run(params.id ?? '');
  }, []);

  const renderContet = () => {
    return (
      <div className={classNames('d-flex flex-column flex-lg-row', styles.content)}>
        <div id="nav-pills" className={classNames('d-none d-lg-block flex-shrink-0', styles.tabs)}>
          {mountPlan ? <MountNav /> : <RaiseNav />}
        </div>
        <div
          className={classNames('d-flex flex-column flex-grow-1', styles.main)}
          tabIndex={0}
          data-bs-spy="scroll"
          data-bs-target="#nav-pills"
          data-bs-smooth-scroll="true"
          data-bs-root-margin="0px 0px -80%"
        >
          {mountPlan ? <MountMain /> : <RaiseMain />}
        </div>
        <div className={classNames('flex-shrink-0', styles.sidebar)}>{mountPlan ? <MountSider /> : <RaiseSider />}</div>
      </div>
    );
  };

  return (
    <>
      <div className="container">
        <LoadingView data={plan} error={isError} loading={isLoading} retry={refetch}>
          {/* {mountPlan ? <MountHeader data={data} /> : <RaiseHeader data={data} />} */}
          <AssetsHeader
            data={plan}
            extra={
              <div className="d-flex align-items-center gap-3 text-nowrap">
                <RaiseActions />
              </div>
            }
          />

          {renderContet()}
        </LoadingView>
      </div>

      {/* <Calculator /> */}

      <p>
        <br />
      </p>
    </>
  );
}
