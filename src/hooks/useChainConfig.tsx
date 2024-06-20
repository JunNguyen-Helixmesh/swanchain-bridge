import { useChains } from 'wagmi'
import { useState, useEffect, useContext } from 'react'
import { MainnetContext } from '@/pages/_app'

export function useChainConfig() {
  const [chainInfoAsObject, setChainObject] = useState<any>({})
  const [allChainInfoAsObject, setAllChainObject] = useState<any>({})
  const chainInfoFromConfig = useChains()
  const { isMainnet } = useContext(MainnetContext)

  // console.log(chainInfoFromConfig[1])

  useEffect(() => {
    let chainObj: { [key: string]: Object } = chainInfoFromConfig
      .filter((chain) => chain.testnet == !isMainnet)
      .reduce((acc: any, chain: any) => {
        acc[chain.id] = {
          chainId: chain.id,
          name: chain.name,
          nativeCurrency: chain.nativeCurrency,
          testnet: chain.testnet,
          l1ChainId: chain.l1ChainId,
          blockExplorer: chain.blockExplorers?.default.url,
          rpcUrl: chain.rpcUrls?.default.http[0],
          contracts: chain.opContracts,
        }

        return acc
      }, {})

    let allChainObj: { [key: string]: Object } = chainInfoFromConfig.reduce(
      (acc: any, chain: any) => {
        acc[chain.id] = {
          chainId: chain.id,
          name: chain.name,
          nativeCurrency: chain.nativeCurrency,
          testnet: chain.testnet,
          l1ChainId: chain.l1ChainId,
          blockExplorer: chain.blockExplorers?.default.url,
          rpcUrl: chain.rpcUrls?.default.http[0],
          contracts: chain.opContracts,
        }

        return acc
      },
      {},
    )

    setChainObject(chainObj)
    setAllChainObject(allChainObj)
  }, [isMainnet])

  return {
    allChainInfoFromConfig: chainInfoFromConfig,
    allChainInfoAsObject,
    chainInfoFromConfig: chainInfoFromConfig.filter(
      (chain) => chain.testnet == !isMainnet,
    ),
    chainInfoAsObject,
  }
}

export default useChainConfig
