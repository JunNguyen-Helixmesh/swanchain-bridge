import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './pages/_app';
import "./assets/style/main.scss"
import "bootstrap/dist/css/bootstrap.min.css";
import { store } from './store'
import { Provider } from 'react-redux'
import { WagmiConfig, createConfig, createStorage } from 'wagmi'
import { configureChains } from '@wagmi/core'
import { sepolia } from '@wagmi/core/chains'
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'

export const RACE = {
    id: Number(process.env.REACT_APP_L2_CHAIN_ID),
    name: "RACE Testnet",
    network: "RACE",
    iconUrl: "https://i.imgur.com/Q3oIdip.png",
    iconBackground: "#000000",
    nativeCurrency: {
        decimals: 18,
        name: 'ETHEREUM',
        symbol: 'ETH'
    },
    rpcUrls: {
        default: {
            http: [String(process.env.REACT_APP_L2_RPC_URL)]
        },
    },
    blockExplorers: {
        default: { name: "RACE Testnet Explorer", url: process.env.REACT_APP_L2_EXPLORER_URL }
    },
    testnet: true

}


const { chains, publicClient } = configureChains(
    [sepolia, RACE],
    [
        jsonRpcProvider({
            rpc: (chain: { rpcUrls: { default: { http: any[]; }; }; }) => ({ http: chain.rpcUrls.default.http[0] })

        })
    ])

export const connectors = [
    new MetaMaskConnector({
        chains,
        options : {
            shimDisconnect: false,
        }
    }),
];

export const config = createConfig({
    autoConnect: true,
    connectors,
    storage: createStorage({ storage: window.localStorage }),
    publicClient,
})
const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement ? rootElement : document.createElement('div'));


