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
} from 'wagmi'
import TabMenu from './TabMenu'
import { HiSwitchHorizontal } from 'react-icons/hi'
import NextImage from 'next/image'
import { formatUnits } from 'viem'
const optimismSDK = require('@eth-optimism/sdk')
const ethers = require('ethers')

const Deposit: React.FC = () => {
  const [ethValue, setEthValue] = useState<string>('')
  const [sendToken, setSendToken] = useState<string>('ETH')
  const { address, isConnected } = useAccount()
  const [errorInput, setErrorInput] = useState<string>('')
  const [loader, setLoader] = useState<boolean>(false)
  const { chain } = useAccount()
  const [checkMetaMask, setCheckMetaMask] = useState<string>('')
  const { chains, switchChain } = useSwitchChain()
  const [showModal, setShowModal] = useState(false)
  const [isDepositSuccessful, setIsDepositSuccessful] = useState(false)
  const chainId = useChainId()
  const [destinationChainId, setDestinationChainId] = useState('20241133')
  const balance = useBalance({
    address: address,
    chainId: chainId,
  }).data

  console.log(balance)

  const handleDeposit = async () => {
    try {
      if (!ethValue) {
        setErrorInput('Please enter the amount')
      } else {
        if (!(parseFloat(ethValue) > 0)) {
          setErrorInput('Invalid Amount Entered!')
        } else {
          let l1Url = process.env.NEXT_PUBLIC_L1_RPC_URL
          let l2Url = process.env.NEXT_PUBLIC_L2_RPC_URL
          let AddressManager = process.env.NEXT_PUBLIC_LIB_ADDRESSMANAGER
          let L1CrossDomainMessenger =
            process.env.NEXT_PUBLIC_PROXY_OVM_L1CROSSDOMAINMESSENGER
          let L1StandardBridge =
            process.env.NEXT_PUBLIC_PROXY_OVM_L1STANDARDBRIDGE
          let L2OutputOracle = process.env.NEXT_PUBLIC_L2_OUTPUTORACLE_PROXY
          let OptimismPortal = process.env.NEXT_PUBLIC_OPTIMISM_PORTAL_PROXY
          if (destinationChainId == '20241133') {
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
            var depositETHEREUM = await crossChainMessenger.depositETH(
              weiValue.toString(),
            )
            const receiptETH = await depositETHEREUM.wait()
            if (receiptETH) {
              console.log(receiptETH)
              setIsDepositSuccessful(true)
              // await callGalxeAPI();
              // setTimeout(fetchBalance, 3000)

              if (destinationChainId == '20241133') {
                await callGalxeAPI()
              }
            }
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
  // ============= For Format balance =========================
  const formatBalance = (rawBalance: string) => {
    const balance = (parseInt(rawBalance) / 1000000000000000000).toFixed(6)
    return balance
  }

  useEffect(() => {
    console.log('Network changed:', chainId)
  }, [chainId])

  const changeChain = (event: any) => {
    const targetChainId = event.target.value
    // switchChain({ chainId: Number(targetChainId) })
    setDestinationChainId(targetChainId)
  }

  return (
    <>
      <div className="bridge_wrap">
        <TabMenu />
        <section className="deposit_wrap">
          <div className="deposit_price_wrap">
            <div className="deposit_price_title">
              <p>From</p>
              <h5 className="flex-row">
                <FaEthereum /> Sepolia Testnet
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
                  <option value="2024">Swan Saturn</option>
                  <option value="20241133">Swan Proxima</option>
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
              <p> You’ll receive: {ethValue ? ethValue : '0'} sETH</p>
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
              Please ensure you are connected to MetaMask & the Sepolia Testnet.
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
            ) : Number(chain?.id) !==
              Number(process.env.NEXT_PUBLIC_L1_CHAIN_ID) ? (
              <button
                className="btn deposit_btn flex-row"
                onClick={() =>
                  switchChain({
                    chainId: Number(process.env.NEXT_PUBLIC_L1_CHAIN_ID),
                  })
                }
              >
                <HiSwitchHorizontal />
                Switch to Sepolia
              </button>
            ) : checkDisabled ? (
              <button className="btn deposit_btn flex-row" disabled={true}>
                Deposit
              </button>
            ) : (
              <button
                className="btn deposit_btn flex-row"
                onClick={handleDeposit}
                disabled={loader ? true : false}
              >
                {loader ? (
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                ) : (
                  'Deposit'
                )}
              </button>
            )}
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
}

export default Deposit
