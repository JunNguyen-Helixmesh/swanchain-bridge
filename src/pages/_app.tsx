// Temp disable server side rendering for min viable product
import dynamic from 'next/dynamic'
import Head from 'next/head'
import { createWeb3Modal } from '@web3modal/wagmi/react'
import { defaultWagmiConfig } from '@web3modal/wagmi/react/config'
import {
  WagmiProvider,
  createConfig,
  http,
  cookieStorage,
  createStorage,
  cookieToInitialState,
} from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'
import Header from '../components/common/Header'
import Footer from '../components/common/Footer'
import type { AppProps } from 'next/app'
import { useEffect, useState } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import '../assets/style/account/account.scss'
import '../assets/style/account/withdrawAccount.scss'
import '../assets/style/deposit.scss'
import '../assets/style/withdraw.scss'
import '../assets/style/withdraw-history.scss'
import '../assets/style/main.scss'
import '../assets/style/common/header.scss'
import '../assets/style/common/footer.scss'
import '../assets/style/common/_color_variable.scss'

const queryClient = new QueryClient()

export const SWAN = {
  id: Number(process.env.NEXT_PUBLIC_L2_CHAIN_ID),
  name: 'Saturn',
  network: 'SWAN',
  iconUrl: 'https://i.imgur.com/Q3oIdip.png',
  iconBackground: '#000000',
  nativeCurrency: {
    decimals: 18,
    name: 'Swan ETH',
    symbol: 'sETH',
  },
  rpcUrls: {
    default: {
      http: [String(process.env.NEXT_PUBLIC_L2_RPC_URL)],
    },
  },
  blockExplorers: {
    default: {
      name: 'Swan Testnet Explorer',
      url: process.env.NEXT_PUBLIC_L2_EXPLORER_URL || '',
    },
  },
  testnet: true,
}

export const SWAN_PROXIMA = {
  id: Number(process.env.NEXT_PUBLIC_L2_PROXIMA_CHAIN_ID),
  name: 'Proxima',
  network: 'SWAN',
  iconUrl: 'https://i.imgur.com/Q3oIdip.png',
  iconBackground: '#000000',
  nativeCurrency: {
    decimals: 18,
    name: 'Swan ETH',
    symbol: 'sETH',
  },
  rpcUrls: {
    default: {
      http: [String(process.env.NEXT_PUBLIC_L2_PROXIMA_RPC_URL)],
    },
  },
  blockExplorers: {
    default: {
      name: 'Swan Testnet Explorer',
      url: process.env.NEXT_PUBLIC_L2_PROXIMA_EXPLORER_URL || '',
    },
  },
  testnet: true,
}

const noopStorage = {
  getItem: (_key: any) => '',
  setItem: (_key: any, _value: any) => {},
  removeItem: (_key: any) => {},
}

const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
}

export const wagmiConfig = defaultWagmiConfig({
  chains: [SWAN, sepolia, SWAN_PROXIMA],
  projectId: String(process.env.NEXT_PUBLIC_PRODUCT_ID),
  metadata,
  ssr: true,
  // storage: createStorage({
  //   storage: cookieStorage,
  // }),
  // ...wagmiOptions // Optional - Override createConfig parameters
})

createWeb3Modal({
  wagmiConfig: wagmiConfig,
  projectId: String(process.env.NEXT_PUBLIC_PRODUCT_ID),
  themeVariables: {
    '--w3m-accent': '#447dff',
    '--w3m-border-radius-master': '2px',
  },
})

export const provider = createConfig({
  chains: [SWAN, sepolia, SWAN_PROXIMA],
  connectors: [injected()],
  multiInjectedProviderDiscovery: true,
  syncConnectedChain: true,
  storage: createStorage({
    storage: typeof window !== 'undefined' ? window.localStorage : noopStorage,
  }),
  transports: {
    [SWAN.id]: http(SWAN.rpcUrls.default.http[0]),
    [SWAN_PROXIMA.id]: http(SWAN_PROXIMA.rpcUrls.default.http[0]),
    [sepolia.id]: http(sepolia.rpcUrls.default.http[0]),
  },
})

export const connector = injected({ target: 'metaMask' })

function MyApp({ Component, pageProps }: AppProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <Head>
          <title>SwanETH Bridge</title>
          <meta
            name="description"
            content="Welcome to the Swan Bridge. We will NEVER ask for your private keys or seed phrase."
          />
          <link rel="icon" href="/assets/images/swantoken.png" />
        </Head>
        <Header />
        <div className="main_wrap">
          {isMounted && <Component {...pageProps} />}
        </div>
        <Footer />
      </QueryClientProvider>
    </WagmiProvider>
  )
}

export default MyApp
