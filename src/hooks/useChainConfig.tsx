import { useChains } from 'wagmi'
import { useState, useEffect } from 'react'

export function useChainConfig() {
  const [chainInfoAsObject, setChainObject] = useState<any>({})
  const chainInfoFromConfig = useChains()

  useEffect(() => {
    let chainObj: { [key: string]: Object } = chainInfoFromConfig.reduce(
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
  }, [])

  return { chainInfoFromConfig, chainInfoAsObject }
}

export default useChainConfig
