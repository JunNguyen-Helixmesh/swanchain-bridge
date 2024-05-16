import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useSearchParams } from 'next/navigation'
import Head from 'next/head'

import { Spinner } from 'react-bootstrap'
import { GrSend } from 'react-icons/gr'
import { IoMdTime } from 'react-icons/io'
import { LuShield } from 'react-icons/lu'
import { HiDownload, HiDotsVertical } from 'react-icons/hi'
import { useAccount } from 'wagmi'
import axios from 'axios'
import ReactPaginate from 'react-paginate'

const { ethers } = require('ethers')
const optimismSDK = require('@eth-optimism/sdk')
// const Web3 = require('web3')

const OUTPUT_ORACLE_ABI = [
  {
    inputs: [],
    name: 'latestBlockNumber',
    outputs: [
      {
        internalType: 'uint256',
        name: '',
        type: 'uint256',
      },
    ],
    stateMutability: 'view',
    type: 'function',
  },
]

const WithdrawHistory: React.FC = (walletAddress: any) => {
  const { address, isConnected } = useAccount()
  const [withdrawals, setWithdrawals] = useState([])
  const [loader, setLoader] = useState<boolean>(false)
  const [modalData, setModalData] = useState<any>(null)
  const [offset, setOffset] = useState<Number>(0)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [totalRows, setTotalRows] = useState<number>(0)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Fetch data from API
    const fetchData = async () => {
      try {
        setLoader(true)
        // const page = searchParams.get('page') ?? '1'
        const offset = 10 * (currentPage - 1)
        // router.push(
        //   {
        //     pathname: '/withdraw-history',
        //     query: { page: currentPage },
        //   },
        //   undefined,
        //   { shallow: true },
        // )
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_ROUTE}/withdraw_transactions?wallet_address=${address}&limit=10&offset=${offset}`
          // `http://localhost:3001/withdraw-history/${address}`,
        ) // Replace '/api/withdrawals' with your API endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        let data = await response.json()
        // console.log(data)
        let withdrawal_data = data.data
        let withdrawal_list = withdrawal_data.withdraw_transaction_list

        let saturnUrl = process.env.NEXT_PUBLIC_L2_RPC_URL
        let proximaUrl = process.env.NEXT_PUBLIC_L2_PROXIMA_RPC_URL
        const saturnProvider = new ethers.providers.JsonRpcProvider(
          saturnUrl,
          'any'
        )
        const proximaProvider = new ethers.providers.JsonRpcProvider(
          proximaUrl,
          'any'
        )

        withdrawal_list = await Promise.all(
          withdrawal_list.map(async (w: any) => {
            let tx_hash = w.withdraw_tx_hash
            // w.withdraw_tx_hash.slice(0, 2) == '0x'
            //   ? w.withdraw_tx_hash
            //   : `0x${w.withdraw_tx_hash}`

            let receipt = null
            let block = null

            if (w.chain_id == '2024') {
              receipt = await saturnProvider.getTransaction(tx_hash)
              block = await saturnProvider.getBlock(receipt.blockNumber)
            } else if (w.chain_id == '20241133') {
              receipt = await proximaProvider.getTransaction(tx_hash)
              block = await proximaProvider.getBlock(receipt.blockNumber)
            }
            return {
              ...w,
              tx_hash,
              amount: ethers.utils.formatEther(receipt.value),
              timestamp: block.timestamp,
              block_number: receipt.blockNumber,
              // receipt: await l2Provider.getTransaction(tx_hash),
            }
          })
        )

        // let receipt = await l2Provider.getTransaction(
        //   withdrawal_list[0].tx_hash,
        // )

        // console.log(await l2Provider.getBlock(receipt.blockNumber))

        setTotalRows(withdrawal_data.total)

        // console.log(withdrawal_list)
        setWithdrawals(withdrawal_list)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
      setLoader(false)
    }

    if (address && isConnected) fetchData()
  }, [address, isConnected, currentPage])

  const closeModal = () => {
    setModalData(null)
  }

  const checkModalClick = (e: any) => {
    if (e.target.className == 'modal-container') {
      closeModal()
    }
  }

  const handlePageClick = (event: any) => {
    // const newOffset = (event.selected * itemsPerPage) % items.length
    setLoader(true)
    console.log(`User requested page number ${event.selected + 1}`)
    setCurrentPage(event.selected + 1)
  }

  const getModalData = async (rowData: any) => {
    let l1Url = process.env.NEXT_PUBLIC_L1_RPC_URL
    // let l2Url = process.env.NEXT_PUBLIC_L2_RPC_URL
    let L2OutputOracle = process.env.NEXT_PUBLIC_L2_OUTPUTORACLE_PROXY
    if (rowData.chain_id == '20241133') {
      // l2Url = process.env.NEXT_PUBLIC_L2_PROXIMA_RPC_URL
      L2OutputOracle = process.env.NEXT_PUBLIC_L2_PROXIMA_OUTPUTORACLE_PROXY
    }

    const l1Provider = new ethers.providers.JsonRpcProvider(l1Url, 'any')
    // const l2Provider = new ethers.providers.JsonRpcProvider(l2Url, 'any')

    // const web3 = new Web3(l1Url)

    const outputOracleContract = new ethers.Contract(
      L2OutputOracle,
      OUTPUT_ORACLE_ABI,
      l1Provider
    )

    try {
      rowData.latestOutputtedBlockNumber = Number(
        await outputOracleContract.latestBlockNumber()
      )
      console.log(
        'Result of the view function:',
        rowData.latestOutputtedBlockNumber
      )
      console.log(rowData)

      if (
        rowData.latestOutputtedBlockNumber < Number(rowData.block_number) ||
        rowData.status == 'finalized'
      ) {
        rowData.isButtonDisabled = true
      } else {
        rowData.isButtonDisabled = false
      }

      // Get withdraw transaction details
      // const transaction = await l2Provider.getTransaction(rowData.tx_hash)

      // // If transaction is found and has a value, return the value
      // if (transaction && transaction.value) {
      //   rowData.amount = ethers.utils.formatEther(transaction.value) // Convert value from Wei to Ether
      // } else {
      //   rowData.amount = 'unknown amount'
      // }
    } catch (error) {
      console.error('Error:', error)
      return 'Error occurred while fetching transaction value'
    }

    setModalData(rowData)
  }

  const handleModalButton = async () => {
    let l1Url = process.env.NEXT_PUBLIC_L1_RPC_URL
    let l2Url = process.env.NEXT_PUBLIC_L2_RPC_URL
    let AddressManager = process.env.NEXT_PUBLIC_LIB_ADDRESSMANAGER
    let L1CrossDomainMessenger =
      process.env.NEXT_PUBLIC_PROXY_OVM_L1CROSSDOMAINMESSENGER
    let L1StandardBridge = process.env.NEXT_PUBLIC_PROXY_OVM_L1STANDARDBRIDGE
    let L2OutputOracle = process.env.NEXT_PUBLIC_L2_OUTPUTORACLE_PROXY
    let OptimismPortal = process.env.NEXT_PUBLIC_OPTIMISM_PORTAL_PROXY
    if (modalData.chain_id == '20241133') {
      l2Url = process.env.NEXT_PUBLIC_L2_PROXIMA_RPC_URL
      AddressManager = process.env.NEXT_PUBLIC_PROXIMA_LIB_ADDRESSMANAGER
      L1CrossDomainMessenger =
        process.env.NEXT_PUBLIC_PROXIMA_PROXY_OVM_L1CROSSDOMAINMESSENGER
      L1StandardBridge =
        process.env.NEXT_PUBLIC_PROXIMA_PROXY_OVM_L1STANDARDBRIDGE
      L2OutputOracle = process.env.NEXT_PUBLIC_L2_PROXIMA_OUTPUTORACLE_PROXY
      OptimismPortal = process.env.NEXT_PUBLIC_PROXIMA_OPTIMISM_PORTAL_PROXY
    }
    const l1Provider = new ethers.providers.Web3Provider(window.ethereum)
    const l2Provider = new ethers.providers.JsonRpcProvider(l2Url, 'any')
    const l1Signer = l1Provider.getSigner(address)
    const l2Signer = l2Provider.getSigner(address)
    const zeroAddr = '0x'.padEnd(42, '0')
    const l1Contracts = {
      StateCommitmentChain: zeroAddr,
      CanonicalTransactionChain: zeroAddr,
      BondManager: zeroAddr,
      AddressManager,
      L1CrossDomainMessenger,
      L1StandardBridge,
      OptimismPortal,
      L2OutputOracle,
    }
    const crossChainMessenger = new optimismSDK.CrossChainMessenger({
      contracts: {
        l1: l1Contracts,
      },
      // bridges: bridges,
      l1ChainId: Number(process.env.NEXT_PUBLIC_L1_CHAIN_ID),
      l2ChainId: Number(process.env.NEXT_PUBLIC_L2_CHAIN_ID),
      l1SignerOrProvider: l1Signer,
      l2SignerOrProvider: l2Signer,
      // bedrock: true,
    })
    console.log(address)

    try {
      setLoader(true)

      // Create a FormData object
      const formData = new FormData()
      formData.append('chain_id', modalData.chain_id)
      formData.append('tx_hash', modalData.tx_hash)

      const url = `${process.env.NEXT_PUBLIC_API_ROUTE}/withdrawal/update_status`

      let response = null
      if (modalData.status == 'initiated') {
        response = await crossChainMessenger.proveMessage(modalData.tx_hash)
        formData.append('stauts', 'proven')
      } else if (modalData.status == 'proven') {
        response = await crossChainMessenger.finalizeMessage(modalData.tx_hash)
        formData.append('stauts', 'finalized')
      }
      await response.wait()

      console.log('sdk response:', response)

      const crossChainMessage = await crossChainMessenger.toCrossChainMessage(
        response
      )

      console.log('crosschain message:', crossChainMessage)
      const transactionHash = crossChainMessage.transactionHash

      if (transactionHash !== null) {
        setLoader(false)
      }

      let result = await axios.post(url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      console.log(result.data)
    } catch (error) {
      setLoader(false)
      console.error('Error:', error)
      return 'Error occurred while fetching transaction value'
    }
  }

  return (
    <>
      <Head>
        <title>Withdraw History</title>
        <meta name='description' content='Withdraw History' />
      </Head>

      <div className='history_wrap'>
        <div>
          <h2>Withdrawal History {isConnected}</h2>
          {loader && !modalData ? (
            <div className='loading'>
              <div className='loading-text'>Loading...</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Amount</th>
                  <th>Network</th>
                  <th>Transaction Hash</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((withdrawal: any, index) => (
                  <tr
                    key={index}
                    onClick={async (e: any) => {
                      if (e.target.className != 'tx_hash')
                        getModalData(withdrawal)
                    }}
                  >
                    <td>
                      {new Date(withdrawal.timestamp * 1000).toLocaleString()}
                    </td>
                    <td>{withdrawal.amount}</td>
                    <td>
                      {withdrawal.chain_id == '2024'
                        ? 'Saturn'
                        : withdrawal.chain_id == '20241133'
                        ? 'Proxima'
                        : withdrawal.chain_id}
                    </td>
                    <td>
                      <a
                        className='tx_hash'
                        target='_blank'
                        href={
                          withdrawal.chain_id == '2024'
                            ? `https://saturn-explorer.swanchain.io/tx/${withdrawal.tx_hash}`
                            : `https://proxima-explorer.swanchain.io/tx/${withdrawal.tx_hash}`
                        }
                        rel='noopener noreferrer'
                      >
                        {withdrawal.tx_hash.slice(0, 6)}...
                        {withdrawal.tx_hash.slice(-4)}{' '}
                      </a>
                    </td>
                    <td>{withdrawal.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <ReactPaginate
          className='pagination'
          pageClassName='page-number'
          activeClassName='active page-number'
          previousClassName='page-number'
          nextClassName='page-number'
          disabledClassName='disabled'
          breakLabel='...'
          nextLabel='>'
          onPageChange={handlePageClick}
          pageRangeDisplayed={5}
          pageCount={Math.ceil(totalRows / 10)}
          previousLabel='<'
          renderOnZeroPageCount={null}
        />
      </div>
      {modalData && (
        <div className='modal-container' onClick={checkModalClick}>
          <div className='modal'>
            <div className='modal-content'>
              <div className='modal-content-header'>
                <h2>Withdrawal</h2>
                <span className='close' onClick={closeModal}>
                  &times;
                </span>
              </div>
              <div className='modal-amoumt'>
                <span className='title'>Amount to withdraw</span>
                <span className='text'>{modalData.amount} swanETH</span>
              </div>
              <div className='withdraw-flow'>
                <ul>
                  <li
                    className='withdraw-step done'
                    onClick={() => console.log(modalData.isButtonDisabled)}
                  >
                    <GrSend size={28} />
                    Initiate withdraw
                  </li>
                  <li className='vertical-dots'>
                    <HiDotsVertical />
                  </li>
                  <li
                    className={
                      modalData.isButtonDisabled &&
                      modalData.status == 'initiated'
                        ? 'withdraw-step'
                        : 'withdraw-step done'
                    }
                  >
                    <IoMdTime size={28} />
                    Wait for the published withdraw on L1
                  </li>
                  <li className='vertical-dots'>
                    <HiDotsVertical />
                  </li>
                  <li
                    className={
                      modalData.status == 'proven' ||
                      modalData.status == 'finalized'
                        ? 'withdraw-step done'
                        : 'withdraw-step'
                    }
                  >
                    <LuShield size={28} />
                    Prove withdrawal
                  </li>
                  <li className='vertical-dots'>
                    <HiDotsVertical />
                  </li>
                  <li
                    className={
                      modalData.status == 'proven' ||
                      modalData.status == 'finalized'
                        ? 'withdraw-step done'
                        : 'withdraw-step'
                    }
                  >
                    <IoMdTime size={28} />
                    Wait the fault challenge period
                  </li>
                  <li className='vertical-dots'>
                    <HiDotsVertical />
                  </li>
                  <li
                    className={
                      modalData.status == 'finalized'
                        ? 'withdraw-step done'
                        : 'withdraw-step'
                    }
                  >
                    <HiDownload size={28} />
                    Claim withdrawal
                  </li>
                </ul>
              </div>
              <div className='modal-btn-container'>
                <button
                  className={
                    modalData.isButtonDisabled
                      ? 'modal-btn disabled'
                      : 'modal-btn'
                  }
                  disabled={modalData.isButtonDisabled}
                  onClick={() => handleModalButton()}
                >
                  {loader ? (
                    <Spinner animation='border' role='status'>
                      <span className='visually-hidden'>Loading...</span>
                    </Spinner>
                  ) : modalData.status == 'initiated' ? (
                    'Prove withdrawal'
                  ) : (
                    'Claim withdrawal'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default WithdrawHistory
