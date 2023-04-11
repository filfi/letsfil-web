import { useMount } from 'ahooks';
import { createPortal } from 'react-dom';
import { useMemo, useState } from 'react';
import { Outlet, useModel } from '@umijs/max';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { SUPPORTED_CHAINS } from '@/constants';
import { mountPortal, unmountPortal } from '@/helpers/app';

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
  const { initialState } = useModel('@@initialState');
  const [node, setNode] = useState<React.ReactNode>();
  const showAlert = useMemo(() => initialState?.connected && initialState?.chainId && !SUPPORTED_CHAINS.includes(initialState.chainId), [initialState]);

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
      {showAlert && (
        <div className="alert alert-danger fixed-top rounded-0">
          <div className="container text-center">不支持当前网络，请切换到支持的网络</div>
        </div>
      )}

      <Header />

      <main className="ff-layout-main">
        <Outlet />
      </main>

      <Footer />

      {node && createPortal(node, getDom())}
    </>
  );
};

export default BasicLayout;
