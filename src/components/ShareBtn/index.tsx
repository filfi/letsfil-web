import { useRef } from 'react';
import { useMount } from 'ahooks';
import ClipboardJS from 'clipboard';

import Modal from '../Modal';

type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export type ShareBtnProps = Omit<BtnProps, 'type'> & {
  type?: BtnProps['type'];
  text?: string;
  toast?: React.ReactNode;
  onSuccess?: (text: string) => void;
};

const ShareBtn: React.FC<ShareBtnProps> = ({ children, text, toast, type, onSuccess, ...props }) => {
  const ref = useRef<HTMLButtonElement>(null);

  useMount(() => {
    if (!ref.current) return;

    const cb = new ClipboardJS(ref.current);

    cb.on('success', (e) => {
      if (onSuccess) {
        return onSuccess(e.text);
      }

      Modal.alert({ icon: 'success', content: toast ?? '已复制到剪贴板' });
    });
  });

  return (
    // eslint-disable-next-line react/button-has-type
    <button ref={ref} type={type ?? 'button'} {...props} data-clipboard-text={text}>
      {children}
    </button>
  );
};

export default ShareBtn;
