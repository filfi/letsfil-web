import { chains } from '@/constants/config';
// import { ImTokenConnector } from './ImToken';
import { MetaMaskConnector } from './MetaMask';
import { FoxWalletConnector } from './FoxWallet';
import { TokenPocketConnector } from './TokenPocket';

// export { ImTokenConnector } from './ImToken';
export { MetaMaskConnector } from './MetaMask';
export { FoxWalletConnector } from './FoxWallet';
export { TokenPocketConnector } from './TokenPocket';

export function connectorAdapter(wallet: string) {
  switch (wallet) {
    // case 'imToken':
    // return new ImTokenConnector({ chains });
    case 'FoxWallet':
      return new FoxWalletConnector({ chains });
    case 'TokenPocket':
      return new TokenPocketConnector({ chains });
    case 'MetaMask':
      return new MetaMaskConnector({ chains });
  }
}
