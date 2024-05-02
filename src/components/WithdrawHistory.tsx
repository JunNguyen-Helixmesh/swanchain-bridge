import React, { useEffect, useState } from 'react'

import Head from 'next/head'

const WithdrawHistory: React.FC = () => {
  const [withdrawals, setWithdrawals] = useState([])

  useEffect(() => {
    // Fetch data from API
    const fetchData = async () => {
      try {
        const response = await fetch('/api/withdrawals') // Replace '/api/withdrawals' with your API endpoint
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

  return (
    <>
      <Head>
        <title>Withdraw History</title>
        <meta name="description" content="Withdraw History" />
      </Head>

      <div className="bridge_wrap">
        <h2>Withdrawal History</h2>
        <table>
          <thead>
            <tr>
              <th>Network</th>
              <th>Transaction Hash</th>
              <th>Amount</th>
              <th>Time</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {withdrawals.map((withdrawal: any, index) => (
              <tr key={index}>
                <td>{withdrawal.network}</td>
                <td>{withdrawal.transactionHash}</td>
                <td>{withdrawal.amount}</td>
                <td>{withdrawal.time}</td>
                <td>{withdrawal.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}

export default WithdrawHistory
