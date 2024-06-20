import React, {
  useEffect,
  useState,
  FunctionComponent,
  useContext,
} from 'react'
import { useRouter } from 'next/router'
import {
  Navbar,
  Image,
  Container,
  Nav,
  Dropdown,
  DropdownButton,
  OverlayTrigger,
  Tooltip,
  TooltipProps,
  Modal,
} from 'react-bootstrap'
import Link from 'next/link'
import logo from '../../assets/images/swantoken.png'
import {
  useAccount,
  useConnect,
  useConfig,
  useChainId,
  useSwitchChain,
} from 'wagmi'
import { injected } from 'wagmi/connectors'
import { FaEthereum } from 'react-icons/fa'
import { BiInfoCircle, BiPowerOff } from 'react-icons/bi'
import { IoMdWallet } from 'react-icons/io'
import { HiSwitchHorizontal } from 'react-icons/hi'
import { MdContentCopy } from 'react-icons/md'
import { AiOutlineDownload, AiOutlineUpload } from 'react-icons/ai'
//import { CopyToClipboard } from "react-copy-to-clipboard";
import NextImage from 'next/image'

import { useChainConfig } from '../../hooks/useChainConfig'
import { MainnetContext } from '../../pages/_app'

const HeaderNew: FunctionComponent = () => {
  const [copyTextSourceCode, setCopyTextSourceCode] = useState<string>(
    'Copy address to clipboard',
  )
  const { address, isConnected } = useAccount()
  const [getNetwork, setNetwork] = useState<string | undefined>()
  const [checkMetaMask, setCheckMetaMask] = useState<boolean>(false)
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false)
  const { chain } = useAccount()

  const { chains, switchChain } = useSwitchChain()
  // const { chains } = useConfig()
  const { connect } = useConnect()

  const [showModal, setShowModal] = useState(false)
  const chainId = useChainId()

  const [hydrationLoad, setHydrationLoad] = useState(true)
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const { chainInfoFromConfig, chainInfoAsObject } = useChainConfig()
  const { isMainnet, setIsMainnet } = useContext(MainnetContext)

  useEffect(() => {
    setHydrationLoad(false)
  }, [])

  useEffect(() => {
    if (isConnected) {
      console.log('Success', { address, chainId: chain?.id })
      setCheckMetaMask(false)
    } else {
      setCheckMetaMask(true)
    }
  }, [isConnected, address, chain])
  // const { disconnect } = useDisconnect()
  // const handleDisconnect = async () => {
  //   await disconnect()
  // }
  // useEffect(() => {
  //   if (chainInfoFromConfig.some((chainInfo) => chainInfo.id == chain?.id)) {
  //     setNetwork(chain?.name)
  //     console.log(chain?.name)
  //     console.log(chain)
  //   } else {
  //     setNetwork('Unsupported Network')
  //   }
  // }, [chain, chainInfoFromConfig, chainInfoAsObject])
  const handleSourceCopy = () => {
    if (copyTextSourceCode === 'Copy address to clipboard') {
      setCopyTextSourceCode('Copied.')
    }
  }
  const renderTooltip = (props: TooltipProps) => (
    <Tooltip id="button-tooltip" {...props}>
      {copyTextSourceCode}
    </Tooltip>
  )
  const changeChain = (event: any) => {
    const targetChainId = event.target.value
    switchChain({ chainId: Number(targetChainId) })
  }
  const handleOptionSelect = (destination: string) => {
    // const selectedOption = event.target.value
    // router.push(event.target.value)
    // event.target.value = ''

    router.push(destination)
  }
  return (
    <>
      <header className="app_header flex-row">
        <div className="  header_btn_wrap header-flex">
          <a href="/">
            <svg
              className="logo-svg"
              viewBox="0 0 107 38"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M1.79895 26.9304V19.1523L2.60059 19.6228V27.3913L1.79895 26.9304ZM28.4409 26.1713L30.0296 27.1092L17.1387 35.0529V33.3976L28.4409 26.1713ZM15.6426 2.15701V3.27936L4.38244 10.1163L3.15017 9.38869L15.6426 2.15701ZM30.7103 16.4567L17.4689 8.97688V2.51044L30.7103 9.81345V16.4567ZM4.10179 20.5033L15.4846 27.1808V34.7962L4.10179 28.2538V20.5033ZM33.1118 27.0821L5.99331 11.0675L15.6426 5.20923V9.82811L16.6035 10.3115L32.4308 19.2515V8.95098L16.1991 -0.000511169L0 9.37599L26.8432 25.2277L17.1387 31.4325V26.2695L16.2657 25.7951V25.7934H16.2631L0.0788947 16.2992V27.7748L2.60059 29.224V29.2345H2.61916L16.5896 37.2637L33.1118 27.0821Z"
                fill="#447DFF"
              />
              <path
                d="M47.4741 26.0226V23.9223C48.1101 24.2203 48.7751 24.4521 49.4585 24.6142C50.1587 24.783 50.8107 24.8668 51.4149 24.8668C52.3009 24.8668 52.9545 24.6987 53.3756 24.3619C53.7967 24.0251 54.0067 23.573 54.0067 23.0053C54.0067 22.4943 53.8135 22.061 53.4271 21.7051C53.0397 21.3498 52.2413 20.9287 51.0312 20.4421C49.788 19.9372 48.9133 19.3603 48.4074 18.7113C47.9013 18.0633 47.6483 17.2836 47.6483 16.3733C47.6483 15.2331 48.0515 14.3357 48.8583 13.6816C49.6651 13.0272 50.7481 12.7004 52.1074 12.7004C53.41 12.7004 54.7073 12.9867 55.9979 13.5592L55.294 15.3816C54.0825 14.8701 53.0016 14.6144 52.051 14.6144C51.3275 14.6144 50.7782 14.7719 50.404 15.087C50.0295 15.4021 49.8424 15.8181 49.8424 16.3359C49.8424 16.6911 49.9174 16.9952 50.0671 17.2475C50.2169 17.5005 50.4631 17.7392 50.8067 17.9631C51.1494 18.1881 51.7669 18.4841 52.6592 18.852C53.6628 19.2699 54.3956 19.6597 54.859 20.0215C55.3218 20.383 55.6611 20.7919 55.8775 21.2469C56.0934 21.702 56.2014 22.2381 56.2014 22.8558C56.2014 24.0651 55.7634 25.0138 54.8883 25.7019C54.0126 26.3905 52.8048 26.7344 51.2652 26.7344C49.7213 26.7344 48.4577 26.4972 47.4741 26.0226Z"
                fill="white"
              />
              <path
                d="M59.0938 12.8957H61.3255L63.2793 20.8621C63.5939 22.1344 63.8186 23.2572 63.9535 24.2311C64.0238 23.702 64.1298 23.1107 64.2712 22.4571C64.4119 21.8032 64.5407 21.2739 64.6557 20.8694L66.8811 12.8957H69.0943L71.3727 20.9068C71.5882 21.6478 71.8158 22.756 72.0562 24.2311C72.148 23.341 72.3698 22.2082 72.7203 20.8323L74.6404 12.8957H76.8724L73.3419 26.5469H70.8806L68.5333 18.4342L68.1662 16.8934C68.0074 16.2288 67.948 15.7552 67.9883 15.4728C68.0672 15.9068 68.033 16.4403 67.8833 17.0734C67.7719 17.5476 67.6601 18.0217 67.5479 18.4957L65.1652 26.5469H62.6057L60.8817 19.7133L59.0938 12.8957Z"
                fill="white"
              />
              <path
                d="M83.3231 20.8323H87.301L86.0216 17.1161C85.9286 16.8675 85.7991 16.475 85.6345 15.9396C85.4696 15.4044 85.3558 15.0121 85.2935 14.763C85.1255 15.529 84.8797 16.366 84.5556 17.2752L83.3231 20.8323ZM78.9814 26.5469L84.0888 12.8397H86.517L91.6244 26.5469H89.2524L87.8892 22.7465H82.6697L81.3344 26.5469H78.9814Z"
                fill="white"
              />
              <path
                d="M95.3193 26.5469V12.8957H98.1942L104.886 23.7177H104.946C104.933 23.5745 104.906 23.0535 104.866 22.1539C104.826 21.2543 104.806 20.5523 104.806 20.0482V12.8957H107V26.5469H104.116L97.4021 15.6687H97.3215L97.3721 16.2757C97.4661 17.4334 97.5135 18.492 97.5135 19.4508V26.5469H95.3193Z"
                fill="white"
              />
            </svg>
          </a>
          <button
            className="btn header_btn"
            onClick={() => setIsMainnet(!isMainnet)}
          >
            {`Switch to ${isMainnet ? 'Testnet' : 'Mainnet'}`}
          </button>
        </div>
        <div className="btn header_btn_wrap">
          {hydrationLoad ? (
            <></>
          ) : (
            <div className="header-flex">
              <div className="page-select-conatainer">
                <button
                  className="btn header_btn flex-row "
                  onClick={() => {
                    router.pathname == '/withdraw-history'
                      ? handleOptionSelect('/deposit')
                      : handleOptionSelect('/withdraw-history')
                  }}
                >
                  {/* <HiSwitchHorizontal /> */}
                  <span>
                    {router.pathname == '/withdraw-history'
                      ? 'Bridge'
                      : 'Withdraw History'}
                  </span>
                </button>
              </div>

              <div className="page-select-conatainer">
                <div className="w3m-container">
                  {/* <w3m-network-button /> */}
                  <w3m-button balance="hide" />
                </div>
                {/* {!isConnected ? (
                  <button
                    className="btn header_btn flex-row"
                    onClick={() => {
                      setIsWalletModalOpen(true)
                    }}
                  >
                    Connect Wallet
                  </button>
                ) : (
                  <button className="page-select">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </button>
                )} */}
                <div>
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
                </div>
                <Modal
                  show={showModal}
                  onHide={() => setShowModal(false)}
                  centered
                  style={{
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1000,
                  }}
                >
                  <div
                    style={{
                      backgroundColor: 'white',
                      borderRadius: '10px',
                      maxWidth: '500px',
                      width: '100%',
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div style={{ padding: '20px', color: 'black' }}>
                      <h2>Install MetaMask</h2>
                      <p style={{ marginBottom: '20px' }}>
                        You need to install MetaMask to use this application.
                        Click the button below to install it.
                      </p>
                      <a
                        href="https://metamask.io/"
                        target="_blank"
                        style={{
                          color: 'white',
                          backgroundColor: '#447dff',
                          padding: '10px 20px',
                          borderRadius: '5px',
                          textDecoration: 'none',
                          marginTop: '20px',
                        }}
                      >
                        Install MetaMask
                      </a>
                    </div>
                  </div>
                </Modal>
                <div>
                  {isWalletModalOpen && (
                    <div
                      style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        zIndex: 1000,
                      }}
                      onClick={() => setIsWalletModalOpen(false)}
                    />
                  )}
                </div>
                <Modal
                  show={isWalletModalOpen}
                  onHide={() => setIsWalletModalOpen(false)}
                  centered
                  style={{
                    zIndex: 2000,
                    position: 'fixed',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: '#333',
                    color: 'white',
                    borderRadius: '15px',
                    width: '80%',
                    maxWidth: '600px',
                    height: '60%',
                    overflow: 'auto',
                  }}
                >
                  <Modal.Header>
                    <Modal.Title style={{ textAlign: 'center' }}>
                      Select a Supported Wallet
                    </Modal.Title>
                  </Modal.Header>
                  <Modal.Body>
                    <div
                      className="wallet-option"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'flex-start',
                        justifyContent: 'center',
                        paddingLeft: '20px',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        if (window.ethereum?.isMetaMask) {
                          connect({
                            connector: injected({ target: 'metaMask' }),
                          })
                          setIsWalletModalOpen(false)
                        } else {
                          setIsWalletModalOpen(false)
                          setShowModal(true)
                        }
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.opacity = '0.5'
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.opacity = '1'
                        }}
                      >
                        <img
                          src="/assets/images/MetaMask_Fox.png"
                          alt="MetaMask"
                          style={{
                            width: '50px',
                            height: '50px',
                            transition: 'opacity 0.3s ease',
                          }}
                        />
                        <p>MetaMask</p>
                      </div>
                    </div>
                  </Modal.Body>
                </Modal>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  )
}
export default HeaderNew
