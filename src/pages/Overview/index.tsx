import { useMemo } from 'react';
import classNames from 'classnames';
import { ScrollSpy } from 'bootstrap';
import { useParams } from '@umijs/max';
import { useDebounceEffect } from 'ahooks';

import styles from './styles.less';
import { isMountPlan } from '@/helpers/mount';
import useRaiseInfo from '@/hooks/useRaiseInfo';
import LoadingView from '@/components/LoadingView';
import MountNav from './components/MountNav';
import MountMain from './components/MountMain';
import MountSider from './components/MountSider';
import MountHeader from './components/MountHeader';
import RaiseNav from './components/RaiseNav';
import RaiseMain from './components/RaiseMain';
import RaiseSider from './components/RaiseSider';
import RaiseHeader from './components/RaiseHeader';

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

  const mountPlan = useMemo(() => isMountPlan(data), [data]);

  useDebounceEffect(updateScrollSpy, [data], { wait: 300 });

  const renderContet = () => {
    return (
      <div className={classNames('d-flex flex-column flex-lg-row', styles.content)}>
        <div id="nav-pills" className={classNames('d-none d-lg-block flex-shrink-0', styles.tabs)}>
          {mountPlan ? <MountNav data={data} /> : <RaiseNav data={data} />}
        </div>
        <div
          className={classNames('d-flex flex-column flex-grow-1', styles.main)}
          tabIndex={0}
          data-bs-spy="scroll"
          data-bs-target="#nav-pills"
          data-bs-smooth-scroll="true"
          data-bs-root-margin="0px 0px -80%"
        >
          {mountPlan ? <MountMain data={data} /> : <RaiseMain data={data} />}
        </div>
        <div className={classNames('flex-shrink-0', styles.sidebar)}>{mountPlan ? <MountSider data={data} /> : <RaiseSider data={data} />}</div>
      </div>
    );
  };

  return (
    <>
      <div className="container">
        <LoadingView data={data} error={!!error} loading={isLoading} retry={refetch}>
          {mountPlan ? <MountHeader data={data} /> : <RaiseHeader data={data} />}

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
