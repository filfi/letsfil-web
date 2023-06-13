import { ConnectorNotFoundError } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { ProviderRpcError, ResourceNotFoundRpcError, UserRejectedRequestError, getAddress } from 'viem';
import type { Address } from 'viem';
import type { Chain, WindowProvider } from 'wagmi';

export type TokenPocketConnectorOptions = {
  /**
   * MetaMask and other injected providers do not support programmatic disconnect.
   * This flag simulates the disconnect behavior by keeping track of connection status in storage. See [GitHub issue](https://github.com/MetaMask/metamask-extension/issues/10353) for more info.
   * @default true
   */
  shimDisconnect?: boolean;
  /**
   * While "disconnected" with `shimDisconnect`, allows user to select a different MetaMask account (than the currently connected account) when trying to connect.
   */
  UNSTABLE_shimOnConnectSelectAccount?: boolean;
};

export class TokenPocketConnector extends InjectedConnector {
  readonly id = 'TokenPocket';

  protected shimDisconnectKey = `${this.id}.shimDisconnect`;

  #UNSTABLE_shimOnConnectSelectAccount: TokenPocketConnectorOptions['UNSTABLE_shimOnConnectSelectAccount'];

  constructor({
    chains,
    options: options_,
  }: {
    chains?: Chain[];
    options?: TokenPocketConnectorOptions;
  } = {}) {
    const options = {
      name: 'TokenPocket',
      shimDisconnect: true,
      getProvider() {
        function getReady(ethereum?: WindowProvider) {
          const isTokenPocket = !!ethereum?.isTokenPocket;
          if (!isTokenPocket) return;
          return ethereum;
        }

        if (typeof window === 'undefined') return;
        const ethereum = (window as unknown as { ethereum?: WindowProvider }).ethereum;
        if (ethereum?.providers) return ethereum.providers.find(getReady);
        return getReady(ethereum);
      },
      ...options_,
    };
    super({ chains, options });

    this.#UNSTABLE_shimOnConnectSelectAccount = options.UNSTABLE_shimOnConnectSelectAccount;
  }

  async connect({ chainId }: { chainId?: number } = {}) {
    try {
      const provider = await this.getProvider();
      if (!provider) throw new ConnectorNotFoundError();

      if (provider.on) {
        provider.on('accountsChanged', this.onAccountsChanged);
        provider.on('chainChanged', this.onChainChanged);
        provider.on('disconnect', this.onDisconnect);
      }

      this.emit('message', { type: 'connecting' });

      // Attempt to show wallet select prompt with `wallet_requestPermissions` when
      // `shimDisconnect` is active and account is in disconnected state (flag in storage)
      let account: Address | null = null;
      if (this.#UNSTABLE_shimOnConnectSelectAccount && this.options?.shimDisconnect && !this.storage?.getItem(this.shimDisconnectKey)) {
        account = await this.getAccount().catch(() => null);
        const isConnected = !!account;
        if (isConnected)
          // Attempt to show another prompt for selecting wallet if already connected
          try {
            await provider.request({
              method: 'wallet_requestPermissions',
              params: [{ eth_accounts: {} }],
            });
            // User may have selected a different account so we will need to revalidate here.
            account = await this.getAccount();
          } catch (error) {
            // Not all TokenPocket injected providers support `wallet_requestPermissions` (e.g. TokenPocket iOS).
            // Only bubble up error if user rejects request
            if (this.isUserRejectedRequestError(error)) throw new UserRejectedRequestError(error as Error);
            // Or TokenPocket is already open
            if ((error as ProviderRpcError).code === new ResourceNotFoundRpcError(error as ProviderRpcError).code) throw error;
          }
      }

      if (!account) {
        const accounts = await provider.request({
          method: 'eth_requestAccounts',
        });
        account = getAddress(accounts[0] as string);
      }

      // Switch to chain if provided
      let id = await this.getChainId();
      let unsupported = this.isChainUnsupported(id);
      if (chainId && id !== chainId) {
        const chain = await this.switchChain(chainId);
        id = chain.id;
        unsupported = this.isChainUnsupported(id);
      }

      if (this.options?.shimDisconnect) this.storage?.setItem(this.shimDisconnectKey, true);

      return { account, chain: { id, unsupported }, provider };
    } catch (error) {
      if (this.isUserRejectedRequestError(error)) throw new UserRejectedRequestError(error as Error);
      if ((error as ProviderRpcError).code === -32002) throw new ResourceNotFoundRpcError(error as ProviderRpcError);
      throw error;
    }
  }
}
