import React, { useEffect, useState } from 'react'

import Head from 'next/head'

const WithdrawHistory: React.FC = () => {
  return (
    <>
      <Head>
        <title>Withdraw History</title>
        <meta name="description" content="Withdraw SwanETH to receive ETH" />
      </Head>

      <div className="bridge_wrap"></div>
    </>
  )
}

export default WithdrawHistory
