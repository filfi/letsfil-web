import { chains } from '@/constants/config';
// import { ImTokenConnector } from './ImToken';
import { MetaMaskConnector } from './MetaMask';
import { FoxWalletConnector } from './FoxWallet';
import { TokenPocketConnector } from './TokenPocket';
import { LedgerConnector } from 'wagmi/connectors/ledger';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';

// export { ImTokenConnector } from './ImToken';
export { MetaMaskConnector } from './MetaMask';
export { FoxWalletConnector } from './FoxWallet';
export { TokenPocketConnector } from './TokenPocket';
export { LedgerConnector } from 'wagmi/connectors/ledger';
export { WalletConnectConnector } from 'wagmi/connectors/walletConnect';

export function connectorAdapter(wallet: string) {
  switch (wallet) {
    // case 'imToken':
    // return new ImTokenConnector({ chains });
    case 'FoxWallet':
      return new FoxWalletConnector({ chains });
    case 'Ledger':
      return new LedgerConnector({ chains });
    case 'MetaMask':
      return new MetaMaskConnector({ chains });
    case 'TokenPocket':
      return new TokenPocketConnector({ chains });
    case 'WalletConnect':
      return new WalletConnectConnector({
        chains,
        options: {
          projectId: '92523fba853f5748e8cc17826029ede2',
          // metadata: {
          //   name: 'FilFi',
          //   icons: [
          //     require('@/components/ClientModal/icons/walletconnect.svg'),
          //   ],
          //   url: 'https://filfi.io',
          //   description: 'Filecoin\'s first 100% smart contract managed storage node co-build solution',
          // },
        },
      });
  }
}
