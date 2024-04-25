import { Tab } from 'bootstrap';
import classNames from 'classnames';
import { useRef, useState } from 'react';
import { useMemoizedFn, useMount, useUnmount } from 'ahooks';

export type BSTab = {
  key: string;
  title: React.ReactNode;
  className?: string;
};

export type BSTabsProps = {
  tabs: BSTab[];
  tabsClassName?: string;
  contentClassName?: string;
  initActiveTab?: string;
  renderItem: (tab: BSTab) => React.ReactNode;
  onTabChange?: (tab: BSTab) => void;
  onShow?: (tab: BSTab) => void;
  onShown?: (tab: BSTab) => void;
  onHide?: (tab: BSTab) => void;
  onHidden?: (tab: BSTab) => void;
};

const getItem = (e: Event, list: BSTab[]) => {
  const target = e.target as HTMLAnchorElement;
  const key = target.getAttribute('href')?.substring(1);
  return list.find((i) => i.key === key);
};

const BSTabs: React.FC<BSTabsProps> = ({
  tabs,
  contentClassName,
  tabsClassName,
  initActiveTab,
  renderItem,
  onHide,
  onHidden,
  onShow,
  onShown,
  onTabChange,
}) => {
  const ul = useRef<HTMLUListElement>(null);

  const [activeTab, setActiveTab] = useState(initActiveTab ?? tabs[0]?.key);

  const onTabHide = (e: Event) => {
    const tab = getItem(e, tabs);

    if (tab) onHide?.(tab);
  };

  const onTabHidden = (e: Event) => {
    const tab = getItem(e, tabs);

    if (tab) onHidden?.(tab);
  };

  const onTabShow = useMemoizedFn((e: Event) => {
    const tab = getItem(e, tabs);

    if (tab) {
      onShow?.(tab);

      if (tab.key !== activeTab) {
        setActiveTab(tab.key);
        onTabChange?.(tab);
      }
    }
  });

  const onTabShown = (e: Event) => {
    const tab = getItem(e, tabs);

    if (tab) onShown?.(tab);
  };

  const bindEvents = () => {
    ul.current?.addEventListener('show.bs.tab', onTabShow);
    ul.current?.addEventListener('shown.bs.tab', onTabShown);
    ul.current?.addEventListener('hide.bs.tab', onTabHide);
    ul.current?.addEventListener('hidden.bs.tab', onTabHidden);
  };

  const unbindEvents = () => {
    ul.current?.removeEventListener('show.bs.tab', onTabShow);
    ul.current?.removeEventListener('shown.bs.tab', onTabShown);
    ul.current?.removeEventListener('hide.bs.tab', onTabHide);
    ul.current?.removeEventListener('hidden.bs.tab', onTabHidden);
  };

  const onMount = () => {
    if (activeTab) {
      const el = ul.current?.querySelector(`[data-bs-toggle="tab"][href="#${activeTab}"]`);
      if (el) {
        const tab = Tab.getOrCreateInstance(el);
        tab?.show();
      }
    }

    bindEvents();
  };

  useMount(onMount);
  useUnmount(unbindEvents);

  return (
    <>
      <ul ref={ul} className={classNames('nav nav-tabs gap-3', tabsClassName)} role="tablist">
        {tabs.map((tab) => (
          <li key={tab.key} className={classNames('nav-item', tab.className)} role="presentation">
            <a className="nav-link" href={`#${tab.key}`} role="tab" data-bs-toggle="tab">
              {tab.title}
            </a>
          </li>
        ))}
      </ul>
      <div className={classNames('tab-content', contentClassName)}>
        {tabs.map((tab) => (
          <div key={tab.key} id={tab.key} className={classNames('tab-pane fade')} role="tabpanel">
            {renderItem(tab)}
          </div>
        ))}
      </div>
    </>
  );
};

export default BSTabs;
