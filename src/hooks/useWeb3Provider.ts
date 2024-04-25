import { providers } from 'ethers';
import { useConfig, usePublicClient } from 'wagmi';

export default function useWeb3Provider() {
  const config = useConfig();
  const pub = usePublicClient();

  const getProvider = async () => {
    const chainId = pub.chain.id;
    const client = await config.connector?.getProvider();

    if (client) {
      return new providers.Web3Provider(client, chainId);
    }
  };

  return {
    getProvider,
  };
}
