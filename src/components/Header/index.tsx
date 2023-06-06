import classNames from 'classnames';
import { Tooltip } from 'bootstrap';
import { useMemo, useRef, useState } from 'react';
import { FormattedMessage, history, Link, useLocation, useModel } from '@umijs/max';
import { useAsyncEffect, useBoolean, useMount, useScroll, useUpdateEffect } from 'ahooks';

import './styles.less';
import SpinBtn from '../SpinBtn';
import useAccount from '@/hooks/useAccount';
import { formatAmount } from '@/utils/format';
import { ReactComponent as Brand } from '@/assets/brand.svg';
import { ReactComponent as IconUser } from '@/assets/icons/user-02.svg';
import { ReactComponent as IconWallet } from '@/assets/icons/wallet-03.svg';
import { ReactComponent as IconDiscord } from '@/assets/socials/discord.svg';
import { ReactComponent as IconTwitter } from '@/assets/socials/twitter.svg';
import { ReactComponent as IconTelegram } from '@/assets/socials/telegram.svg';

const headerHeight = 80;

const Header: React.FC = () => {
  // refs
  const header = useRef<HTMLDivElement>(null);

  // models
  const { initialState } = useModel('@@initialState');

  // states
  const [balance, setBalance] = useState<any>();
  const [isHover, { setTrue, setFalse }] = useBoolean(false);

  // hooks
  const position = useScroll();
  const location = useLocation();
  const { account, withAccount, getBalance, connect, disconnect } = useAccount();

  const percent = useMemo(() => Math.min(position?.top ?? 0, headerHeight) / headerHeight, [position?.top]);

  const fetchBalance = withAccount(async (account) => {
    const balance = await getBalance(account);

    setBalance(balance);
  });

  useAsyncEffect(fetchBalance, [account]);

  useUpdateEffect(setFalse, [location]);

  useMount(() => {
    document.querySelectorAll('[data-bs-toggle="tooltip"]').forEach((el) => new Tooltip(el));
  });

  const handleConnect = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault();

    connect();
  };

  const handleDisconnect = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault();

    setFalse();

    disconnect();

    history.replace('/');
  };

  const socials = [
    {
      icon: IconDiscord,
      title: 'Discord',
      desc: 'Ask us question',
      url: 'https://discord.gg/tht348jhuy',
    },
    {
      icon: IconTwitter,
      title: 'Twitter',
      desc: 'Follow us on @FilFi',
      url: 'https://twitter.com/filfi_io',
    },
    {
      icon: IconTelegram,
      title: 'Telegram',
      desc: 'Join disscution',
      url: 'https://t.me/+eDw3nnwV7xQwZGM9',
    },
  ];

  return (
    <header ref={header} className={classNames('header fixed-top bg-white')} style={{ boxShadow: `0 3px 10px rgba(0, 0, 0, ${percent * 0.15})` }}>
      <nav className="navbar navbar-expand-lg">
        <div className="container position-relative">
          <Link className="navbar-brand" to="/">
            <Brand />
          </Link>

          <div className="btn-group assets-bar" role="group" aria-label="Assets Bar">
            {initialState?.connected ? (
              <>
                {initialState?.processing ? (
                  <SpinBtn className="btn btn-outline-light" loading>
                    <FormattedMessage id="notify.transaction.processing" />
                  </SpinBtn>
                ) : (
                  <button className="btn btn-outline-light d-inline-flex align-items-center" type="button">
                    <span className="lh-1">
                      <IconWallet />
                    </span>

                    <span className="ms-1">{formatAmount(balance)} FIL</span>

                    {/* <span className="vr mx-2 d-none d-md-inline"></span>

                    <span className="d-none d-md-inline">{formatAddr(accounts[0])}</span> */}
                  </button>
                )}
                <div className="btn-group dropdown" role="group" onMouseEnter={setTrue} onMouseLeave={setFalse}>
                  <Link to="/account" className="btn btn-outline-light rounded-end">
                    <span className="lh-1">
                      <IconUser />
                    </span>
                  </Link>

                  <ul
                    className={classNames('dropdown-menu dropdown-menu-end border-0 shadow rounded-4', { show: isHover })}
                    data-bs-popper={isHover ? 'static' : undefined}
                  >
                    <li>
                      <Link className="dropdown-item" to="/account">
                        <span className="bi bi-person"></span>
                        <span className="ms-2">个人资料</span>
                      </Link>
                    </li>
                    <li className="dropdown-divider"></li>
                    <li>
                      <a className="dropdown-item" href="#" onClick={handleDisconnect}>
                        <span className="bi bi-box-arrow-right"></span>
                        <span className="ms-2">退出</span>
                      </a>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <SpinBtn className="btn btn-outline-light btn-lg" loading={initialState?.connecting} onClick={handleConnect}>
                <FormattedMessage id="actions.button.connect" />
              </SpinBtn>
            )}
          </div>

          <div id="navbarOffcanvas" className="offcanvas offcanvas-start" tabIndex={-1} aria-labelledby="navbar offcanvas">
            <div className="offcanvas-header">
              <h4 className="offcanvas-title">
                <Brand />
              </h4>
              <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
            </div>
            <div className="offcanvas-body">
              <ul className="nav navbar-nav">
                <li className="nav-item">
                  <a className="nav-link" data-bs-toggle="tooltip" data-bs-placement="bottom" data-bs-title="即将上线">
                    <FormattedMessage id="menu.lending" />
                  </a>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/">
                    <FormattedMessage id="menu.miner" />
                  </Link>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link" data-bs-toggle="dropdown" data-bs-auto-close="true" aria-expanded="false">
                    <span className="me-2">
                      <FormattedMessage id="menu.storage" />
                    </span>

                    <span className="bi bi-chevron-down align-middle fw-600 text-gray-dark"></span>
                  </a>

                  <div className="dropdown-menu border-0 shadow rounded-4">
                    <div className="d-flex flex-column gap-2">
                      <a className="dropdown-item d-flex px-4 py-3">
                        <span className="me-3">Borrow FIL</span>
                        <span className="badge ms-auto">coming soon</span>
                      </a>
                      <a className="dropdown-item d-flex px-4 py-3">
                        <span className="me-3">Raise FIL</span>
                        <span className="badge ms-auto">coming soon</span>
                      </a>
                      <a className="dropdown-item d-flex px-4 py-3">
                        <span className="me-3">SP Foundry</span>
                        <span className="badge ms-auto">coming soon</span>
                      </a>
                    </div>
                  </div>
                </li>
                <li className="nav-item dropdown">
                  <a className="nav-link" data-bs-toggle="dropdown" data-bs-auto-close="true" aria-expanded="false">
                    <span className="me-2">
                      <FormattedMessage id="menu.dao" />
                    </span>

                    <span className="bi bi-chevron-down align-middle fw-600 text-gray-dark"></span>
                  </a>

                  <div className="dropdown-menu border-0 shadow rounded-4">
                    <div className="d-flex flex-column gap-2">
                      {socials.map((item, key) => (
                        <a key={key} className="dropdown-item d-flex px-4 py-3" href={item.url} target="_blank" rel="noreferrer">
                          <span className="flex-shrink-0 me-3">{<item.icon />}</span>
                          <span className="flex-grow-1">
                            <span className="d-block fw-600 mb-1">{item.title}</span>
                            <span className="d-block text-gray">{item.desc}</span>
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                </li>
                <li className="nav-item">
                  <a className="nav-link" href="https://docs.filfi.io/en/introduction.html" target="_blank" rel="noreferrer">
                    <FormattedMessage id="menu.docs" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#navbarOffcanvas"
            aria-controls="navbarOffcanvas"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          {/* <div ref={collapse} id="navbarCollapse" className="collapse navbar-collapse">
            <ul className="nav navbar-nav flex-grow-1 mb-3 mb-lg-0">
              <li className="nav-item">
                <NavLink className="nav-link" to="/">
                  <FormattedMessage id="menu.home" />
                </NavLink>
              </li>
              <li className="nav-item">
                <NavLink className="nav-link" to="/raising">
                  <FormattedMessage id="menu.raising" />
                </NavLink>
              </li>
            </ul>
          </div> */}
        </div>
      </nav>
    </header>
  );
};

export default Header;
