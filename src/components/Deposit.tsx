import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { Form, Image, Spinner, Modal, Button } from 'react-bootstrap'
import { Dai, Usdt, Usdc, Ethereum, Btc } from 'react-web3-icons'
import toIcn from '../assets/images/swantoken.png'
import { FaEthereum } from 'react-icons/fa'
import {
  useAccount,
  useConnect,
  useSwitchChain,
  useConfig,
  useBalance,
  useChainId,
  useSendTransaction,
  useWaitForTransactionReceipt,
  useChains,
} from 'wagmi'
import TabMenu from './TabMenu'
import { HiSwitchHorizontal } from 'react-icons/hi'
import NextImage from 'next/image'
import { formatUnits, Address } from 'viem'
import { useChainConfig } from '../hooks/useChainConfig'
const optimismSDK = require('@eth-optimism/sdk')
const ethers = require('ethers')

const Deposit: React.FC = () => {
  const [ethValue, setEthValue] = useState<string>('')
  const [sendToken, setSendToken] = useState<string>('ETH')
  const { address, isConnected } = useAccount()
  const account = useAccount()
  const [errorInput, setErrorInput] = useState<string>('')
  const [loader, setLoader] = useState<boolean>(false)
  const { chain } = useAccount()
  const { chainInfoFromConfig, chainInfoAsObject } = useChainConfig()
  const [l1ChainInfo, setL1ChainInfo] = useState<any>({})
  const [l2ChainInfo, setL2ChainInfo] = useState<any>({})
  const [checkMetaMask, setCheckMetaMask] = useState<string>('')
  const { chains, switchChain } = useSwitchChain()
  const [showModal, setShowModal] = useState(false)
  const [isDepositSuccessful, setIsDepositSuccessful] = useState(false)
  const chainId = useChainId()
  const [destinationChainId, setDestinationChainId] = useState(
    chainInfoFromConfig[2].id,
  )
  const { data: hash, sendTransaction, isPending } = useSendTransaction()
  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
  } = useWaitForTransactionReceipt({
    hash,
  })
  let balance = useBalance({
    address: address,
    chainId: chainId,
  }).data

  // console.log(balance)

  const handleDeposit = async () => {
    try {
      if (!ethValue) {
        setErrorInput('Please enter the amount')
      } else {
        if (!(parseFloat(ethValue) > 0)) {
          setErrorInput('Invalid Amount Entered!')
        } else {
          let l1Url = l1ChainInfo.rpcUrl
          let l2Url = l2ChainInfo.rpcUrl
          let AddressManager = l2ChainInfo.contracts.addressManager
          let L1CrossDomainMessenger =
            l2ChainInfo.contracts.l1CrossDomainMessenger
          let L1StandardBridge = l2ChainInfo.contracts.l1StandardBridge
          let L2OutputOracle = l2ChainInfo.contracts.l2OutputOracle
          let OptimismPortal = l2ChainInfo.contracts.optimismPortal

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
            l1ChainId: Number(l1ChainInfo.chainId),
            l2ChainId: Number(destinationChainId),
            l1SignerOrProvider: l1Signer,
            l2SignerOrProvider: l2Signer,
            // bedrock: true,
          })
          if (sendToken === 'ETH') {
            console.log(sendToken)
            const weiValue = parseInt(
              ethers.utils.parseEther(ethValue)._hex,
              16,
            )
            setLoader(true)
            console.log(account)
            console.log(window.ethereum)
            sendTransaction({
              to: L1StandardBridge as Address,
              value: ethers.utils.parseEther(ethValue),
            })
            // var depositETHEREUM = await crossChainMessenger.depositETH(
            //   weiValue.toString(),
            // )
            // const receiptETH = await depositETHEREUM.wait()
            // if (receiptETH) {
            //   console.log(receiptETH)
            //   setIsDepositSuccessful(true)
            //   // await callGalxeAPI();
            //   // setTimeout(fetchBalance, 3000)

            //   if (destinationChainId == '20241133') {
            //     await callGalxeAPI()
            //   }
            // }
          }
        }
      }
    } catch (error) {
      console.log({ error }, 98)
    } finally {
      setLoader(false)
      setEthValue('')
      // fetchBalance()
    }
  }

  const callGalxeAPI = async () => {
    try {
      // Define the data to be sent in the request body
      const postData = {
        wallet_address: address,
      }

      // Make the POST request using Axios
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_ROUTE}/galxe/update_credentials`,
        postData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      )

      // Handle the response
      console.log(response.data)
    } catch (error) {
      // Handle errors
      console.error('Error:', error)
    }
  }

  const [checkDisabled, setCheckDisabled] = useState(false)
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (sendToken == 'ETH') {
      if (
        balance?.value &&
        Number(formatUnits(balance.value, balance.decimals)) <
          Number(e.target.value)
      ) {
        setCheckDisabled(true)
        setErrorInput('Insufficient ETH balance.')
      } else {
        setCheckDisabled(false)
        setErrorInput('')
      }
      setEthValue(e.target.value)
    }
  }

  useEffect(() => {
    console.log('Network changed:', chainId)
  }, [chainId])

  useEffect(() => {
    if (chainInfoAsObject) {
      setL1ChainInfo(chainInfoAsObject[chainInfoFromConfig[0].id])
      setL2ChainInfo(chainInfoAsObject[destinationChainId])
    }
  }, [chainInfoAsObject])

  useEffect(() => {
    if (chainInfoAsObject) {
      setL1ChainInfo(
        chainInfoAsObject[chainInfoAsObject[destinationChainId]?.l1ChainId],
      )
      setL2ChainInfo(chainInfoAsObject[destinationChainId])
    }
  }, [destinationChainId])

  const changeChain = (event: any) => {
    const targetChainId = event.target.value
    // switchChain({ chainId: Number(targetChainId) })
    setDestinationChainId(targetChainId)
  }

  if (chainInfoAsObject && l1ChainInfo && l2ChainInfo) {
    return (
      <>
        <div className="bridge_wrap">
          <TabMenu />
          <section className="deposit_wrap">
            <div className="deposit_price_wrap">
              <div className="deposit_price_title">
                <p>From</p>
                <h5 className="flex-row">
                  <FaEthereum /> {l1ChainInfo?.name}
                </h5>
              </div>
              <div className="deposit_input_wrap">
                <Form>
                  <div className="deposit_inner_input">
                    <Form.Control
                      type="number"
                      value={ethValue}
                      onChange={handleChange}
                      placeholder="0"
                      min="0"
                      step="any"
                    />
                    <Form.Select
                      aria-label="Default select example"
                      className="select_wrap"
                      onChange={({ target }) => setSendToken(target.value)}
                    >
                      <option>ETH</option>
                      {/* <option value="DAI">DAI</option>
                    <option value="USDC">USDC</option>
                    <option value="USDT">USDT</option>
                    <option value="wBTC">wBTC</option> */}
                    </Form.Select>
                  </div>
                  <div className="input_icn_wrap">
                    {sendToken == 'ETH' ? (
                      <span className="input_icn flex-row">
                        <Ethereum style={{ fontSize: '1.5rem' }} />
                      </span>
                    ) : (
                      <span></span>
                    )}
                  </div>
                </Form>
              </div>
              {errorInput && (
                <small className="text-danger">{errorInput}</small>
              )}
              {sendToken === 'ETH' ? (
                address && (
                  <p className="wallet_bal mt-2">
                    Balance: {balance?.formatted} {balance?.symbol}
                  </p>
                )
              ) : (
                <></>
              )}
            </div>
            <div className="up flex-row center">
              <svg
                width="17"
                height="19"
                viewBox="0 0 17 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.5 17.4736L15 11.0696M8.5 17.4736L2 11.0696M8.5 17.4736V1.5"
                  stroke="#447DFF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="deposit_details_wrap">
              <div className="deposit_details">
                <p>To</p>
                <h5 className="flex-row">
                  {/* <Image src={toIcn.src} alt="To icn" fluid /> Swan */}

                  <select value={destinationChainId} onChange={changeChain}>
                    {chainInfoFromConfig.slice(2).map((chain) => (
                      <option key={chain.id} value={chain.id}>
                        {chain.name}
                      </option>
                    ))}
                    {/* <option value="2024">Swan Saturn</option>
                  <option value="20241133">Swan Proxima</option> */}
                  </select>
                </h5>
              </div>
              <div className="deposit_inner_details flex-row">
                {sendToken == 'ETH' ? (
                  <span className="input_icn flex-row">
                    {' '}
                    <Ethereum style={{ fontSize: '1.5rem' }} />
                  </span>
                ) : (
                  <></>
                )}{' '}
                <p>
                  {' '}
                  You’ll receive: {ethValue ? ethValue : '0'}{' '}
                  {l2ChainInfo?.nativeCurrency?.symbol || 'ETH'}
                </p>
              </div>
            </div>
            <div
              className="deposit_btn_wrap"
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <p
                style={{
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  textAlign: 'center',
                  marginTop: '0px',
                  marginBottom: '20px',
                }}
              >
                Please ensure you are connected to MetaMask & the{' '}
                {l1ChainInfo?.name} Network
              </p>
              {checkMetaMask === 'true' ? (
                <a
                  className="btn deposit_btn flex-row"
                  href="https://metamask.io/"
                  target="_blank"
                >
                  <NextImage
                    src="/assets/images/metamask.svg"
                    alt="metamask icn"
                    layout="responsive"
                    width={500}
                    height={300}
                  />
                  Please Install Metamask Wallet
                </a>
              ) : !isConnected ? (
                // <button
                //   className="btn deposit_btn flex-row"
                //   onClick={() => {
                //     setIsWalletModalOpen(true)
                //   }}
                // >
                //   <IoMdWallet />
                //   Connect Wallet
                // </button>
                <w3m-connect-button />
              ) : Number(chain?.id) !== Number(l1ChainInfo.chainId) ? (
                <button
                  className="btn deposit_btn flex-row"
                  onClick={() =>
                    switchChain({
                      chainId: Number(l1ChainInfo.chainId),
                    })
                  }
                >
                  <HiSwitchHorizontal />
                  Switch to {l1ChainInfo.name}
                </button>
              ) : checkDisabled ? (
                <button className="btn deposit_btn flex-row" disabled={true}>
                  Deposit
                </button>
              ) : (
                <button
                  className="btn deposit_btn flex-row"
                  onClick={handleDeposit}
                  disabled={loader || isConfirming ? true : false}
                >
                  {loader || isConfirming ? (
                    <Spinner animation="border" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  ) : (
                    'Deposit'
                  )}
                </button>
              )}
              {!l2ChainInfo.testnet ? (
                <p
                  style={{
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    textAlign: 'left',
                    marginTop: '20px',
                    marginBottom: '0px',
                  }}
                >
                  Warning: This is a mainnet transaction involving real Ethereum
                </p>
              ) : (
                <></>
              )}

              {/* <button
                onClick={() =>
                  // console.log(chainInfoFromConfig[1].rpcUrls.default.http[0])
                  // console.log(chainInfoFromConfig)
                  {
                    console.log(l1ChainInfo)
                    console.log(l2ChainInfo)
                    console.log(balance)
                  }
                }
              >
                My Button
              </button> */}
            </div>{' '}
            {showModal && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  backgroundColor: 'rgba(0, 0, 0, 0.5)',
                  zIndex: 999,
                }}
                onClick={() => setShowModal(false)}
              />
            )}
          </section>
        </div>
      </>
    )
  } else return <div>Loading...</div>
}

export default Deposit
