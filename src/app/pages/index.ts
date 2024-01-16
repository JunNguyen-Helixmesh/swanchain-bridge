import ReactDOM from 'react-dom/client';
import "./assets/style/main.scss"
import "bootstrap/dist/css/bootstrap.min.css";
import { createConfig, http, createStorage } from 'wagmi'
import { sepolia, mainnet } from 'wagmi/chains'
import { injected } from 'wagmi/connectors'


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
})

export const connector = injected({ target: 'metaMask'});


const rootElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement ? rootElement : document.createElement('div'));


