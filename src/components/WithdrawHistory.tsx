import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/router'

import Head from 'next/head'
import { GrSend } from 'react-icons/gr'
import { IoMdTime } from 'react-icons/io'
import { LuShield } from 'react-icons/lu'
import { HiDownload, HiDotsVertical } from 'react-icons/hi'

const { ethers } = require('ethers')

const WithdrawHistory: React.FC = (walletAddress: any) => {
  const [withdrawals, setWithdrawals] = useState([])
  const [modalData, setModalData] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    // Fetch data from API
    const fetchData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3001/withdraw-history/${router.query.walletAddress}`,
        ) // Replace '/api/withdrawals' with your API endpoint
        if (!response.ok) {
          throw new Error('Failed to fetch data')
        }
        const data = await response.json()
        setWithdrawals(data)
      } catch (error) {
        console.error('Error fetching data:', error)
      }
    }

    fetchData()
  }, [])

  const closeModal = () => {
    setModalData(null)
  }

  const getModalData = async (rowData: any) => {
    let rpcUrl = process.env.NEXT_PUBLIC_L2_RPC_URL
    if (rowData.chain_id == '20241133') {
      rpcUrl = process.env.NEXT_PUBLIC_L2_PROXIMA_RPC_URL
    }

    const l2Provider = new ethers.providers.JsonRpcProvider(rpcUrl, 'any')

    try {
      // Get transaction details
      const transaction = await l2Provider.getTransaction(rowData.tx_hash)

      // If transaction is found and has a value, return the value
      if (transaction && transaction.value) {
        rowData.amount = ethers.utils.formatEther(transaction.value) // Convert value from Wei to Ether
      } else {
        rowData.amount = 'unknown amount'
      }
    } catch (error) {
      console.error('Error:', error.message)
      return 'Error occurred while fetching transaction value'
    }

    setModalData(rowData)
  }

  return (
    <>
      <Head>
        <title>Withdraw History</title>
        <meta name="description" content="Withdraw History" />
      </Head>

      <div className="history_wrap">
        <h2>Withdrawal History</h2>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Network</th>
              <th>Transaction Hash</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((withdrawal: any, index) => (
              <tr
                key={index}
                onClick={async () => await getModalData(withdrawal)}
              >
                <td>{withdrawal.timestamp}</td>
                <td>{withdrawal.chain_id}</td>
                <td>
                  {withdrawal.tx_hash.slice(0, 6)}...
                  {withdrawal.tx_hash.slice(-4)}
                </td>
                <td>{withdrawal.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {modalData && (
        <div className="modal-container" onClick={() => setModalData(null)}>
          <div className="modal">
            <div className="modal-content">
              <div className="modal-content-header">
                <h2>Withdrawal</h2>
                <span className="close" onClick={closeModal}>
                  &times;
                </span>
              </div>
              <div className="modal-amoumt">
                <span className="title">Amount to withdraw</span>
                <span className="text">{modalData.amount} swanETH</span>
              </div>
              <div className="withdraw-flow">
                <ul>
                  <li>
                    <GrSend size={28} />
                    Initiate withdraw
                  </li>
                  <li className="vertical-dots">
                    <HiDotsVertical />
                  </li>
                  <li>
                    <IoMdTime size={28} />
                    Wait for the withdraw request published on L1
                  </li>
                  <li className="vertical-dots">
                    <HiDotsVertical />
                  </li>
                  <li>
                    <LuShield size={28} />
                    Prove withdraw
                  </li>
                  <li className="vertical-dots">
                    <HiDotsVertical />
                  </li>
                  <li>
                    <IoMdTime size={28} />
                    Wait the fault challenge period
                  </li>
                  <li className="vertical-dots">
                    <HiDotsVertical />
                  </li>
                  <li>
                    <HiDownload size={28} />
                    Claim withdraw
                  </li>
                </ul>
              </div>
              <div className="modal-btn-container">
                <button className="modal-btn">Prove Withdrawal</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default WithdrawHistory
