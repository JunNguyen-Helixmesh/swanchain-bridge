import { useReadContract } from 'wagmi'

export function useEthPrice(ethValue: any) {
  const { data } = useReadContract({
    abi: [
      {
        inputs: [],
        name: 'decimals',
        outputs: [{ internalType: 'uint8', name: '', type: 'uint8' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'description',
        outputs: [{ internalType: 'string', name: '', type: 'string' }],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [{ internalType: 'uint80', name: '_roundId', type: 'uint80' }],
        name: 'getRoundData',
        outputs: [
          { internalType: 'uint80', name: 'roundId', type: 'uint80' },
          { internalType: 'int256', name: 'answer', type: 'int256' },
          { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
          { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
          { internalType: 'uint80', name: 'answeredInRound', type: 'uint80' },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'latestRoundData',
        outputs: [
          { internalType: 'uint80', name: 'roundId', type: 'uint80' },
          { internalType: 'int256', name: 'answer', type: 'int256' },
          { internalType: 'uint256', name: 'startedAt', type: 'uint256' },
          { internalType: 'uint256', name: 'updatedAt', type: 'uint256' },
          { internalType: 'uint80', name: 'answeredInRound', type: 'uint80' },
        ],
        stateMutability: 'view',
        type: 'function',
      },
      {
        inputs: [],
        name: 'version',
        outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
        stateMutability: 'view',
        type: 'function',
      },
    ],
    address: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
    chainId: 1,
    // name: 'MyCoolContract',
    functionName: 'latestRoundData',
    args: [],
  })

  if (data) return ((Number(data[1]) * Number(ethValue)) / 1e8).toFixed(2)
}

export default useEthPrice
