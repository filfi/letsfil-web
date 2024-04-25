import { createElement, forwardRef, useImperativeHandle, useRef, useState } from 'react';

import Modal from '../Modal';
import styles from './styles.less';
import FormRadio from '../FormRadio';
import { mountPortal, unmountPortal } from '@/helpers/app';

// import IconLedger from './icons/ledger.svg';
import IconMetamask from './icons/metamask.svg';
import IconFoxwallet from './icons/foxwallet.svg';
import IconTokenpocket from './icons/tokenpocket.svg';
// import IconWalletConnect from './icons/walletconnect.svg';
import { ReactComponent as Logo } from '@/assets/logo.svg';

export type ClientModalProps = {
  loading?: boolean;
  showFooter?: boolean;
  showConfirm?: boolean;
  onHidden?: () => void;
  onChange?: (id: string) => void;
  onConfirm?: (id: string) => void;
};

export type ClientModalStatic = React.ForwardRefExoticComponent<ClientModalProps & React.RefAttributes<ModalAttrs>> & {
  show: (options?: ClientModalProps) => ModalAttrs['hide'];
};

function renderIcon(src: string) {
  return <img className="d-block w-100 h-100 rounded-2" src={src} />;
}

const items = [
  { icon: renderIcon(IconMetamask), label: 'MetaMask', value: 'MetaMask' },
  { icon: renderIcon(IconTokenpocket), label: 'TokenPocket', value: 'TokenPocket' },
  { icon: renderIcon(IconFoxwallet), label: 'FoxWallet', value: 'FoxWallet' },
  // { icon: renderIcon(IconLedger), label: 'Ledger(Filecoin)', value: 'Ledger' },
  // { icon: renderIcon(IconWalletConnect), label: 'WalletConnect', value: 'WalletConnect' },
];

const ClientModalRender: React.ForwardRefRenderFunction<ModalAttrs, ClientModalProps> = (
  { loading, showConfirm, showFooter, onHidden, onChange, onConfirm },
  ref?: React.Ref<ModalAttrs> | null,
) => {
  const modal = useRef<ModalAttrs>(null);
  const [value, setValue] = useState('');

  useImperativeHandle(
    ref,
    () => ({
      hide: () => modal.current?.hide(),
      show: () => modal.current?.show(),
      toggle: () => modal.current?.toggle(),
    }),
    [],
  );

  const handleChange = (id: string) => {
    setValue(id);

    onChange?.(id);
  };

  const handleConfirm = () => {
    if (value) {
      onConfirm?.(value);
    }
  };

  return (
    <Modal.Alert
      ref={modal}
      icon={<Logo />}
      title="連接錢包"
      confirmText="連接"
      bodyClassName="p-4"
      className={styles.modal}
      confirmLoading={loading}
      showFooter={showFooter}
      showConfirm={showConfirm}
      onHidden={onHidden}
      onConfirm={handleConfirm}
    >
      <FormRadio grid value={value} items={items} onChange={handleChange} />
    </Modal.Alert>
  );
};

const ClientModal = forwardRef(ClientModalRender) as ClientModalStatic;

ClientModal.show = function (props) {
  let modal: ModalAttrs | null = null;

  const onRef = (ref: ModalAttrs | null) => {
    modal = ref;

    modal?.show();
  };

  const onHidden = () => {
    props?.onHidden?.();

    unmountPortal.current?.();
  };

  const node = createElement(ClientModal, { ...props, onHidden, ref: onRef });

  mountPortal.current?.(node);

  return () => modal?.hide();
};

export default ClientModal;
