import { useState } from 'react';
import { useMount } from 'ahooks';
import { Outlet } from '@umijs/max';
import { createPortal } from 'react-dom';
import { useNetwork, useSwitchNetwork } from 'wagmi';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { chains } from '@/constants/config';
import { mountPortal, unmountPortal } from '@/helpers/app';
import useInputScrollAction from '@/hooks/useInputScrollAction';

function getDom() {
  let dom = document.querySelector('#portal');

  if (!dom) {
    dom = document.createElement('div');
    dom.setAttribute('id', 'portal');
    document.body.appendChild(dom);
  }

  return dom;
}

function removeDom() {
  const dom = document.querySelector('#portal');

  if (dom?.childElementCount === 0) {
    document.querySelector('#portal')?.remove();
  }
}

const BasicLayout: React.FC = () => {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork({
    chainId: chains[0].id,
    onError: (e) => {
      console.log(e);
      console.log(e.cause);
    },
  });

  const [node, setNode] = useState<React.ReactNode>();

  useInputScrollAction();

  const handleSwitch = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    e.preventDefault();

    switchNetwork?.(chains[0].id);
  };

  useMount(() => {
    // @ts-ignore
    mountPortal.current = (node: React.ReactNode) => {
      setNode(node);
    };

    // @ts-ignore
    unmountPortal.current = () => {
      setNode(undefined);

      setTimeout(removeDom, 1000 / 60);
    };
  });

  return (
    <>
      {chain?.unsupported && (
        <div className="alert alert-danger fixed-top rounded-0">
          <div className="container">
            <p className="mb-0 text-center">
              <span>不支持当前网络，请</span>
              <a className="fw-500 text-underline" href="#" onClick={handleSwitch}>
                切换
              </a>
              <span>到支持的网络</span>
            </p>
          </div>
        </div>
      )}

      <Header />

      <main className="ffi-layout-main">
        <div className="ffi-layout-content">
          <Outlet />
        </div>
      </main>

      <Footer />

      {node && createPortal(node, getDom())}
    </>
  );
};

export default BasicLayout;
