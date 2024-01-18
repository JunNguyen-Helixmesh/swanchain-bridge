// Temp disable server side rendering for min viable product
import dynamic from 'next/dynamic';

import { WagmiProvider, createConfig, http, createStorage } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import type { AppProps} from 'next/app';
import { metaMask } from 'wagmi/connectors'; //will be deprecated soon, switch to walletConnect(reqs projectID)
import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '../assets/style/account/account.scss';
import '../assets/style/account/withdrawAccount.scss';
import '../assets/style/deposit.scss';
import '../assets/style/withdraw.scss';
import '../assets/style/main.scss';
import '../assets/style/common/header.scss';
import '../assets/style/common/footer.scss';
import '../assets/style/common/_color_variable.scss';

const queryClient = new QueryClient();

export const SWAN = {
  id: Number(process.env.NEXT_PUBLIC_L2_CHAIN_ID),
  name: "Swan Testnet",
  network: "SWAN",
  iconUrl: "https://i.imgur.com/Q3oIdip.png",
  iconBackground: "#000000",
  nativeCurrency: {
      decimals: 18,
      name: 'ETHEREUM',
      symbol: 'ETH'
  },
  rpcUrls: {
      default: {
          http: [String(process.env.NEXT_PUBLIC_L2_RPC_URL)]
      },
  },
  blockExplorers: {
      default: { name: "Swan Testnet Explorer", url: process.env.NEXT_PUBLIC_L2_EXPLORER_URL || "" }
  },
  testnet: true

}

export const provider = createConfig({
  chains: [SWAN, sepolia],
  connectors: [metaMask()],
  storage: typeof window !== 'undefined' ? createStorage({ storage: window.localStorage }) : undefined,
  transports: {
    [SWAN.id]: http(SWAN.rpcUrls.default.http[0]),
    [sepolia.id]: http(sepolia.rpcUrls.default.http[0])
  }
});

export const connector = injected({ target: 'metaMask' });

function MyApp({ Component, pageProps }: AppProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <WagmiProvider config={provider}>
      <QueryClientProvider client={queryClient}>
        <Header />
        <div className="main_wrap">
          {isMounted && <Component {...pageProps} />}
        </div>
        <Footer />
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default MyApp;