declare module '.png';
declare module 'react-render-html';

declare type ModalAttrs = {
  hide: () => void;
  show: () => void;
  toggle: () => void;
};

declare type User = {
  role: 'raiser' | 'investor';
};

declare type InitState = {
  accounts: string[];
  chainId?: string;
  connected: boolean;
  connecting: boolean;
  processing: boolean;
};
