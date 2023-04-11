import classNames from 'classnames';
import { Collapse } from 'bootstrap';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useBoolean, useClickAway, useEventListener, useResponsive, useScroll } from 'ahooks';
import { FormattedMessage, Link, NavLink, setLocale, useIntl, useLocation, useModel } from '@umijs/max';

import './styles.less';
import SpinBtn from '../SpinBtn';
import { locales } from '@/constants';
import useAccounts from '@/hooks/useAccounts';
import { formatAddr, formatEther } from '@/utils/format';
import { ReactComponent as Brand } from '@/assets/brand.svg';
import { ReactComponent as NodeIcon } from '@/assets/icons/fil-node.svg';
import { ReactComponent as Filecoin } from '@/assets/icons/filecoin-fill.svg';

const Header: React.FC = () => {
  // refs
  const header = useRef<HTMLDivElement>(null);
  const collapse = useRef<HTMLDivElement>(null);

  // models
  const { initialState } = useModel('@@initialState');

  // states
  const [balance, setBalance] = useState<any>();
  const [expand, { setTrue, setFalse }] = useBoolean(false);

  // hooks
  const { locale } = useIntl();
  const position = useScroll();
  const location = useLocation();
  const resposive = useResponsive();
  const { accounts, getBalance, handleConnect, handleDisconnect } = useAccounts();

  const percent = useMemo(() => Math.min((position?.top ?? 0) / 80, 1), [position]);
  const localeLabel = useMemo(() => locales.find((_) => _.locale === locale)?.abbr, [locale]);
  const maxHeight = useMemo(() => (resposive.xl ? 160 : resposive.lg ? 120 : 80), [resposive]);
  const headerHeight = useMemo(() => maxHeight - (maxHeight - 80) * percent, [maxHeight, percent]);

  const fetchBalance = async () => {
    if (!accounts[0]) return;

    const balance = await getBalance(accounts[0]);

    setBalance(balance);
  };

  useEffect(() => {
    fetchBalance();
  }, [accounts]);

  useEffect(() => {
    document.documentElement.style.setProperty('--header-height', headerHeight + 'px');
  }, [headerHeight]);

  const closeCollapse = () => {
    const instance = Collapse.getInstance(collapse.current);

    instance?.hide();
  };

  const handleLocale = (locale: string) => {
    setLocale(locale);
  };

  useClickAway(closeCollapse, header);
  useEffect(closeCollapse, [location.pathname]);
  useEventListener('show.bs.collapse', setTrue, { target: collapse });
  useEventListener('hidden.bs.collapse', setFalse, { target: collapse });

  return (
    <header
      ref={header}
      className={classNames('header fixed-top', { shadow: expand })}
      style={{
        backgroundColor: expand ? '#fff' : `rgba(255, 255, 255, ${percent})`,
        boxShadow: `0 3px 10px rgba(0, 0, 0, ${percent * 0.15})`,
      }}
    >
      <nav className="navbar navbar-expand-lg">
        <div className="container">
          <Link className="navbar-brand" to="/">
            <Brand />
          </Link>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarCollapse"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div ref={collapse} id="navbarCollapse" className="collapse navbar-collapse">
            <ul className="nav navbar-nav me-lg-auto mb-3 mb-lg-0">
              <li className="nav-item">
                <NavLink className="nav-link" to="/">
                  <FormattedMessage id="menu.home" />
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/lending">
                  <FormattedMessage id="menu.lending" />
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/letsfil">
                  <FormattedMessage id="menu.letsfil" />
                </NavLink>
              </li>
            </ul>

            <div className="d-flex justify-content-center mb-3 mb-lg-0">
              {initialState?.connected ? (
                <div className="d-flex assets-bar">
                  <div className="d-flex align-items-center px-2">
                    <Filecoin />
                    <span className="assets-bar-amount mx-2">{formatEther(balance)}</span>
                    <span className="assets-bar-unit">FIL</span>
                  </div>

                  {initialState.processing ? (
                    <SpinBtn className="assets-bar-extra p-2 ms-0 processing" loading>
                      <FormattedMessage id="notify.transaction.processing" />
                    </SpinBtn>
                  ) : (
                    <div className="dropdown">
                      <button type="button" className="assets-bar-extra p-2 ms-0" aria-expanded="false" data-bs-toggle="dropdown" data-bs-auto-close="true">
                        <span>{formatAddr(accounts[0])}</span>
                      </button>

                      <div className="dropdown-menu dropdown-menu-end">
                        <div className="d-flex align-items-center mb-3">
                          <NodeIcon />
                          <span className="ms-2">{formatAddr(accounts[0])}</span>
                        </div>

                        <div className="d-flex justify-content-between">
                          <Link className="btn btn-secondary" to="/account">
                            收益概况
                          </Link>
                          <button type="button" className="btn btn-secondary" onClick={handleDisconnect}>
                            断开连接
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <SpinBtn className="btn btn-light btn-connect rounded-pill" loading={initialState?.connecting} onClick={handleConnect}>
                  <FormattedMessage id="actions.button.connect" />
                </SpinBtn>
              )}

              <div className="dropdown ms-4">
                <button type="button" className="btn border-0 h-100 shadow-none" aria-expanded="false" data-bs-toggle="dropdown" data-bs-auto-close="true">
                  {localeLabel}
                </button>

                <ul className="dropdown-menu dropdown-menu-end">
                  {locales.map((item) => (
                    <li key={item.locale}>
                      <button className="dropdown-item" type="button" onClick={() => handleLocale(item.locale)}>
                        <span>{item.icon}</span>
                        <span className="ms-3">{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
