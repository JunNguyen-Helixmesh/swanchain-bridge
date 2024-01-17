import { WagmiConfig, createConfig, http, createStorage } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import type { AppProps} from 'next/app';

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

export const config = createConfig({
  chains: [SWAN, sepolia],
  storage: createStorage({ storage: window.localStorage}),
  transports: {
    [SWAN.id]: http(SWAN.rpcUrls.default.http[0]),
    [sepolia.id]: http(sepolia.rpcUrls.default.http[0])
  }
});

export const connector = injected({ target: 'metaMask'});

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={config}>
      <Header />
      <div className="main_wrap">
        <Component {...pageProps} />
      </div>
      <Footer />
    </WagmiConfig>
  );
}

export default MyApp;