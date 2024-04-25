import { useState } from 'react';
import { useMount } from 'ahooks';
import { Outlet } from '@umijs/max';
import { createPortal } from 'react-dom';
import { useNetwork, useSwitchNetwork } from 'wagmi';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import useAccount from '@/hooks/useAccount';
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

function getStorage<V = any>(key: string) {
  const data = localStorage.getItem(key);

  if (data) {
    try {
      return JSON.parse(data) as V;
    } catch (e) {}

    return data as V;
  }

  return null;
}

const BasicLayout: React.FC = () => {
  const { chain } = useNetwork();
  const { connect } = useAccount();
  const { switchNetwork } = useSwitchNetwork({
    chainId: chains[0].id,
    onError: (e) => {
      console.log(e);
      console.log(e.cause);
    },
  });

  const [node, setNode] = useState<React.ReactNode>();

  useInputScrollAction();

  const autoConnect = () => {
    const id = getStorage<string>('wagmi.wallet');
    const connected = getStorage<boolean>('wagmi.connected');

    if (id && connected) {
      connect({ id, slient: true });
    }
  };

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

    autoConnect();
  });

  return (
    <>
      {chain?.unsupported && (
        <div className="alert alert-danger fixed-top rounded-0">
          <div className="container">
            <p className="mb-0 text-center">
              <span>不支援目前網絡，請</span>
              <a className="fw-500 text-underline" href="#" onClick={handleSwitch}>
                切換
              </a>
              <span>到支援的網絡</span>
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
