import { chains } from '@/constants/config';
import { MetaMaskConnector } from './MetaMask';
import { FoxWalletConnector } from './FoxWallet';
import { TokenPocketConnector } from './TokenPocket';

export { MetaMaskConnector } from './MetaMask';
export { FoxWalletConnector } from './FoxWallet';
export { TokenPocketConnector } from './TokenPocket';

export function connectorAdapter(wallet: string) {
  switch (wallet) {
    case 'FoxWallet':
      return new FoxWalletConnector({ chains });
    case 'TokenPocket':
      return new TokenPocketConnector({ chains });
    case 'MetaMask':
      return new MetaMaskConnector({ chains });
  }
}
