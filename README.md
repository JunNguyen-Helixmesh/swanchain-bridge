# Orchestrator bridge frontend

The Standard Bridge allows easy transfer of ETH between Ethereum and Swan Chain, available on Swan Mainnet and Swan Proxima Testnet.

## L1 to L2 Transactions (Deposit)

Transfers from Ethereum to Swan (L1 to L2) take 1-3 minutes due to the Sequencer waiting for several L1 blocks before confirming the transaction to avoid reorgs.

## L2 to L1 Transactions (Withdraw)

Transfers from Swan to Ethereum (L2 to L1) take 7 days due to the withdrawal challenge period, which ensures security by allowing time to prove the L2 state on L1.

The process includes:

L2 transaction confirmed by the Sequencer (a few seconds).
The block is proposed to L1 (takes ~12 hours).
Proof submitted to L1, followed by finalization after the 7-day challenge period.
Each L2 to L1 transaction involves:

1. Initiate L2 transaction and confirmation (a few seconds).
2. Wait for the L2 block proposed to L1 (a few hours).
3. Submit proof to L1 (can occur anytime after step 2).
4. Wait for the challenge period (7 days).
5. Finalize on L1 after the challenge period.

# Challenge Period

The 7-day challenge period ensures the integrity of transactions, allowing time to challenge potentially incorrect results before they are considered final. Swan Chain uses optimistic rollups which rely on this delay to prevent incorrect results from being accepted, as incorrect transactions can be challenged and corrected during this period.

In summary, while L1 to L2 transfers are quick (1-3 minutes), L2 to L1 transfers take 7 days to ensure security through a challenge period, making the process costly due to L1 verification steps.
