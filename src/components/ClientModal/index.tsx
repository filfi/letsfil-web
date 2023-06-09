import { createElement, forwardRef, useImperativeHandle, useRef, useState } from 'react';

import Modal from '../Modal';
import styles from './styles.less';
import FormRadio from '../FormRadio';
import { mountPortal, unmountPortal } from '@/helpers/app';

// import { defaultWallet } from '@/constants/config';
import { ReactComponent as Logo } from '@/assets/logo.svg';
import { ReactComponent as IconMetaMask } from './icons/metamask.svg';
import { ReactComponent as IconFoxWallet } from './icons/foxwallet.svg';
import { ReactComponent as IconTokenPocket } from './icons/tokenpocket.svg';

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

const items = [
  { icon: <IconMetaMask />, label: 'MetaMask', value: 'MetaMask' },
  { icon: <IconTokenPocket />, label: 'TokenPocket', value: 'TokenPocket' },
  { icon: <IconFoxWallet />, label: 'FoxWallet', value: 'FoxWallet' },
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
      title="连接钱包"
      confirmText="连接"
      bodyClassName="px-4 py-5"
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
