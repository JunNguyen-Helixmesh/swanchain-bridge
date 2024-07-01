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
      console.log('Success', { address, chainId: chain ?.id })
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
  return (
    <>
      <header className="app_header flex-row">
        <div className="header_btn_wrap header-flex">
          <a href="/" className="flex-row">
            <NextImage
              src="/assets/images/logo.png"
              alt="SWAN logo"
              layout="responsive"
              width={86}
              height={30}
              className="logo-svg"
            />
          </a>
          <div className="flex-row items-center">
            <div onClick={() => setIsMainnet(!isMainnet)} className={isMainnet ? 'rounded-btn' : 'rounded-btn active'}>Testnet</div>
            <div onClick={() => setIsMainnet(!isMainnet)} className={isMainnet ? 'rounded-btn active' : 'rounded-btn'}>Mainnet</div>
          </div>
        </div>
        <div className="btn header_btn_wrap">
          {hydrationLoad ? (
            <></>
          ) : (
              <div className="header-flex">
                <div className="page-select-conatainer">
                  <div className="w3m-container">
                    {/* <w3m-network-button /> */}
                    <w3m-button balance="hide" size="sm" />
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
                          if (window.ethereum ?.isMetaMask) {
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
