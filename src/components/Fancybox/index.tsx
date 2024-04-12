import { useRef } from 'react';
import { useMount, useUnmount } from 'ahooks';
import { Fancybox as NativeFancybox } from '@fancyapps/ui';
import '@fancyapps/ui/dist/fancybox/fancybox.css';

export type FancyboxProps = React.HtmlHTMLAttributes<HTMLDivElement> & {
  children?: React.ReactNode;
  delegate?: string;
  options?: Record<string, any>;
};

const Fancybox: React.FC<FancyboxProps> = ({ children, delegate, options, ...props }) => {
  const container = useRef<HTMLDivElement>(null);

  useMount(() => {
    NativeFancybox.bind(container.current, delegate || '[data-fancybox]', options || {});
  });

  useUnmount(() => {
    NativeFancybox.unbind(container.current);
    NativeFancybox.close();
  });

  return (
    <div ref={container} {...props}>
      {children}
    </div>
  );
};

export default Fancybox;
