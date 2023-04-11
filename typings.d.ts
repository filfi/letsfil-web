declare module '.png';
declare module 'bootstrap';
declare module 'react-render-html';

declare type ModalAttrs = {
  hide: () => void;
  show: () => void;
  toggle: () => void;
};

declare type InitState = {
  accounts: string[];
  chainId?: string;
  connected: boolean;
  connecting: boolean;
  processing: boolean;
};
