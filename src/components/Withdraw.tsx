import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Form, Image, Spinner, Modal, Button } from 'react-bootstrap'
import { Dai, Usdt, Usdc, Ethereum, Btc } from 'react-web3-icons'
import { MdOutlineSecurity } from 'react-icons/md'
import { FaEthereum } from 'react-icons/fa'
import Web3 from 'web3'
import toIcn from '../assets/images/swantoken.png'
import {
  useAccount,
  useConnect,
  useSwitchChain,
  useConfig,
  useBalance,
  Connector,
  useChainId,
} from 'wagmi'
import { injected } from 'wagmi/connectors'
import { IoMdWallet } from 'react-icons/io'
import { HiSwitchHorizontal } from 'react-icons/hi'
import NextImage from 'next/image'
import TabMenu from './TabMenu'
import { formatUnits } from 'viem'
import Head from 'next/head'
const optimismSDK = require('@eth-optimism/sdk')
const ethers = require('ethers')

const Withdraw: React.FC = () => {
  const [ethValue, setEthValue] = useState<string>('')
  const [sendToken, setSendToken] = useState<string>('ETH')
  const [errorInput, setErrorInput] = useState<string>('')
  const [checkMetaMask, setCheckMetaMask] = useState<boolean>(false)
  const [loader, setLoader] = useState<boolean>(false)
  const { address, isConnected } = useAccount()
  const { chain } = useAccount()
  const [SwanBalance, setSwanBalance] = useState<number>(0)
  const [metaMastError, setMetaMaskError] = useState<string>('')
  const { connect } = useConnect()
  const { chains, switchChain } = useSwitchChain()
  const [showModal, setShowModal] = useState(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const chainId = useChainId()
  const [balance, setBalance] = useState<string>('')
  const [fromChain, setFromChain] = useState('2024')

  const { data } = useBalance({
    address: address,
    chainId: Number(process.env.NEXT_PUBLIC_L2_CHAIN_ID),
  })

  const handleWithdraw = async () => {
    try {
      if (!ethValue) {
        setErrorInput('Please enter the amount')
      } else {
        if (parseFloat(ethValue) <= 0) {
          setErrorInput('Invalid Amount Entered!')
        } else {
          setErrorInput('')
          let l1Url = process.env.NEXT_PUBLIC_L1_RPC_URL
          let l2Url = process.env.NEXT_PUBLIC_L2_RPC_URL
          let AddressManager = process.env.NEXT_PUBLIC_LIB_ADDRESSMANAGER
          let L1CrossDomainMessenger =
            process.env.NEXT_PUBLIC_PROXY_OVM_L1CROSSDOMAINMESSENGER
          let L1StandardBridge =
            process.env.NEXT_PUBLIC_PROXY_OVM_L1STANDARDBRIDGE
          let L2OutputOracle = process.env.NEXT_PUBLIC_L2_OUTPUTORACLE_PROXY
          let OptimismPortal = process.env.NEXT_PUBLIC_OPTIMISM_PORTAL_PROXY
          if (fromChain == '20241133') {
            l2Url = process.env.NEXT_PUBLIC_L2_PROXIMA_RPC_URL
            AddressManager = process.env.NEXT_PUBLIC_PROXIMA_LIB_ADDRESSMANAGER
            L1CrossDomainMessenger =
              process.env.NEXT_PUBLIC_PROXIMA_PROXY_OVM_L1CROSSDOMAINMESSENGER
            L1StandardBridge =
              process.env.NEXT_PUBLIC_PROXIMA_PROXY_OVM_L1STANDARDBRIDGE
            L2OutputOracle =
              process.env.NEXT_PUBLIC_L2_PROXIMA_OUTPUTORACLE_PROXY
            OptimismPortal =
              process.env.NEXT_PUBLIC_PROXIMA_OPTIMISM_PORTAL_PROXY
          }
          // const bridges = {
          //   Standard: {
          //     l1Bridge: l1Contracts.L1StandardBridge,
          //     l2Bridge: '0x4200000000000000000000000000000000000010',
          //     Adapter: optimismSDK.StandardBridgeAdapter,
          //   },
          //   ETH: {
          //     l1Bridge: l1Contracts.L1StandardBridge,
          //     l2Bridge: '0x4200000000000000000000000000000000000010',
          //     Adapter: optimismSDK.ETHBridgeAdapter,
          //   },
          // }
          const l1Provider = new ethers.providers.JsonRpcProvider(l1Url, 'any')
          const l2Provider = new ethers.providers.Web3Provider(window.ethereum)
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
          //-------------------------------------------------------- SEND TOKEN VALUE -----------------------------------------------------------------

          try {
            if (sendToken == 'ETH') {
              const weiValue = parseInt(
                ethers.utils.parseEther(ethValue)._hex,
                16,
              )
              setLoader(true)
              const response = await crossChainMessenger.withdrawETH(
                weiValue.toString(),
              )
              await response.wait()

              console.log('withdraw response:', response)

              const crossChainMessage = await crossChainMessenger.toCrossChainMessage(
                response,
              )

              console.log('crosschain message:', crossChainMessage)
              const transactionHash = crossChainMessage.transactionHash
              const blockNumber = crossChainMessage.blockNumber

              if (blockNumber !== null) {
                setLoader(false)
                setEthValue('')

                // if (isConnected && address) {
                //   await updateWithdrawHistory(
                //     chainId,
                //     address,
                //     transactionHash,
                //     blockNumber,
                //   )
                //   // await callGalxeAPI();
                // }
                setTimeout(fetchBalance, 3000)
              }
            }
            //-------------------------------------------------------- SEND TOKEN VALUE END-----------------------------------------------------------------
            updateWallet()
          } catch (error) {
            setLoader(false)
            console.log({ error }, 98)
          } finally {
            setLoader(false)
            updateWallet()
            fetchBalance()
          }
        }
      }
    } catch (error) {
      console.log(error)
    }
  }

  ////========================================================== HANDLE CHANGE =======================================================================
  const [checkDisabled, setCheckDisabled] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (sendToken == 'ETH') {
      if (
        data?.value &&
        Number(formatUnits(data.value, data.decimals)) < Number(e.target.value)
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

  const changeChain = (event: any) => {
    const targetChainId = event.target.value
    switchChain({ chainId: Number(targetChainId) })
    setFromChain(targetChainId)
  }

  // ============= For Format balance =========================
  const formatBalance = (rawBalance: string) => {
    const balance = (parseInt(rawBalance) / 1000000000000000000).toFixed(6)
    return balance
  }
  // ============= Get and update balance =========================
  const updateWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const balance = formatBalance(
        await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest'],
        }),
      )
      setSwanBalance(Number(balance))
    } else {
      console.error('Ethereum provider is not available')
    }
  }
  const fetchBalance = async () => {
    if (address) {
      const web3 = new Web3(window.ethereum)
      const balance = await web3.eth.getBalance(address)
      const balanceInEther = web3.utils.fromWei(balance, 'ether')
      const formattedBalance = parseFloat(balanceInEther).toFixed(6)
      setBalance(formattedBalance)
    }
  }
  useEffect(() => {
    const ethereum = window.ethereum

    if (ethereum && ethereum.on && ethereum.removeListener) {
      const handleChainChanged = async () => {
        await fetchBalance()
      }

      ethereum.on('chainChanged', handleChainChanged)

      return () => {
        ethereum.removeListener('chainChanged', handleChainChanged)
      }
    }
  }, [fetchBalance])

  useEffect(() => {
    updateWallet()
  }, [data])

  useEffect(() => {
    console.log('Network changed:', chainId)
  }, [chainId])

  useEffect(() => {
    fetchBalance()
  }, [address])

  return (
    <>
      <Head>
        <title>Withdraw</title>
        <meta name="description" content="Withdraw SwanETH to receive ETH" />
      </Head>
      <div className="bridge_wrap">
        <TabMenu />
        <section className="deposit_wrap">
          {/* <div className="withdraw_title_wrap">
            <div className="withdraw_title_icn">
              <MdOutlineSecurity />
            </div>
            <div className="withdraw_title_content">
              <h3>Use the official bridge</h3>
              <p>This usually takes 7 days</p>
              <p>Bridge any token to Sepolia Testnet</p>
            </div>
          </div> */}
          <div className="deposit_price_wrap">
            <div className="deposit_price_title">
              <p>From</p>
              <h5 className="flex-row">
                {/* <Image src={toIcn.src} alt="To icn" fluid /> Swan */}

                <select value={chainId} onChange={changeChain}>
                  <option value="2024">Swan Saturn</option>
                  {/* <option value="20241133">Swan Proxima</option> */}
                </select>
              </h5>
            </div>
            <div className="deposit_input_wrap">
              <Form>
                <div className="deposit_inner_input">
                  <Form.Control
                    type="number"
                    name="eth_value"
                    value={ethValue}
                    onChange={handleChange}
                    placeholder="0"
                    min="0"
                    step="any"
                  />
                  <Form.Select
                    aria-label="Default select example"
                    className="select_wrap"
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                      setSendToken(event.target.value)
                    }
                  >
                    <option>swanETH</option>
                    {/* <option value="DAI">DAI</option>
                    <option value="USDT">USDT</option>
                    <option value="wBTC">wBTC</option>
                    <option value="USDC">USDC</option> */}
                  </Form.Select>
                </div>
                <div className="input_icn_wrap">
                  {sendToken == 'ETH' ? (
                    <span className="input_icn flex-row">
                      <Ethereum style={{ fontSize: '1.5rem' }} />
                    </span>
                  ) : sendToken == 'DAI' ? (
                    <span className="input_icn flex-row">
                      <Dai style={{ fontSize: '1.5rem' }} />
                    </span>
                  ) : sendToken == 'USDT' ? (
                    <span className="input_icn flex-row">
                      <Usdt style={{ fontSize: '1.5rem' }} />
                    </span>
                  ) : sendToken == 'wBTC' ? (
                    <span className="input_icn flex-row">
                      <Btc style={{ fontSize: '1.5rem' }} />
                    </span>
                  ) : (
                    <span className="input_icn flex-row">
                      <Usdc style={{ fontSize: '1.5rem' }} />
                    </span>
                  )}
                </div>
              </Form>
            </div>
            {errorInput && <small className="text-danger">{errorInput}</small>}
            {sendToken === 'ETH' ? (
              address && (
                <p className="wallet_bal mt-2">Balance: {balance} ETH</p>
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
            <div className="deposit_details flex-row">
              <p>To:</p>
              <h5 className="flex-row">
                <FaEthereum /> Sepolia Testnet
              </h5>
            </div>
            <div className="withdraw_bal_sum">
              {sendToken == 'ETH' ? (
                <span className="input_icn flex-row">
                  <Ethereum style={{ fontSize: '1.5rem' }} />
                </span>
              ) : sendToken == 'DAI' ? (
                <span className="input_icn flex-row">
                  <Dai style={{ fontSize: '1.5rem' }} />
                </span>
              ) : sendToken == 'USDT' ? (
                <span className="input_icn flex-row">
                  <Usdt style={{ fontSize: '1.5rem' }} />
                </span>
              ) : sendToken == 'wBTC' ? (
                <span className="input_icn flex-row">
                  <Btc style={{ fontSize: '1.5rem' }} />
                </span>
              ) : (
                <span className="input_icn flex-row">
                  <Usdc style={{ fontSize: '1.5rem' }} />
                </span>
              )}
              <p>
                You’ll receive: {ethValue ? ethValue : '0'} {sendToken}
              </p>
              <div></div>
              {/* <span className='input_title'>ETH</span> */}
            </div>
          </div>
          <div
            className="deposit_btn_wrap"
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
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
              Please ensure you are connected to MetaMask & Swan Saturn Testnet.
            </p>
            {checkMetaMask === true ? (
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
              <w3m-connect-button />
            ) : Number(chain?.id) !== Number(fromChain) ? (
              <button
                className="btn deposit_btn flex-row"
                onClick={() =>
                  switchChain({
                    chainId: Number(fromChain),
                  })
                }
              >
                <HiSwitchHorizontal />
                {fromChain == '2024'
                  ? 'Switch to Swan Saturn'
                  : 'Switch to Swan Proxima'}
              </button>
            ) : checkDisabled ? (
              <button className="btn deposit_btn flex-row" disabled={true}>
                Initiate Withdrawal
              </button>
            ) : (
              <button
                className="btn deposit_btn flex-row"
                onClick={handleWithdraw}
                disabled={loader ? true : false}
              >
                {loader ? (
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                ) : (
                  'Initiate Withdrawal'
                )}
              </button>
            )}
            <p
              style={{
                color: '#ffffff',
                fontSize: '0.7rem',
                textAlign: 'left',
                marginTop: '20px',
                marginBottom: '0px',
              }}
            >
              After you initiate the withdrawal, please go to the Withdraw
              History page to complete the withdrawal process.
            </p>
            <p
              style={{
                color: '#ffffff',
                fontSize: '0.7rem',
                textAlign: 'left',
                marginTop: '0px',
                marginBottom: '0px',
              }}
            >
              You may need to wait for our blockchain scanner to pickup your
              request.
            </p>
          </div>
        </section>
      </div>
    </>
  )
}
export default Withdraw
