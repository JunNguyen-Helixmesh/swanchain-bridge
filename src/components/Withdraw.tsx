import React, { useEffect, useState } from 'react';
import { Form, Image, Spinner } from "react-bootstrap";
import { Dai, Usdt, Usdc, Ethereum, Btc } from 'react-web3-icons';
import { MdOutlineSecurity } from "react-icons/md"
import { FaEthereum } from "react-icons/fa"
import Web3 from 'web3';
import toIcn from "../assets/images/logo.png"
import { useAccount, useConnect, useSwitchChain, useConfig, useBalance, Connector } from 'wagmi'
import { injected } from 'wagmi/connectors';
import { IoMdWallet } from "react-icons/io"
import { HiSwitchHorizontal } from "react-icons/hi";
import NextImage from 'next/image';
import TabMenu from './TabMenu';
import { formatUnits } from 'viem';
const optimismSDK = require("@eth-optimism/sdk")
const ethers = require("ethers")


const Withdraw: React.FC = () => {
  const [ethValue, setEthValue] = useState<string>("");
  const [sendToken, setSendToken] = useState<string>("ETH");
  const [errorInput, setErrorInput] = useState<string>("");
  const [checkMetaMask, setCheckMetaMask] = useState<boolean>(false);
  const [loader, setLoader] = useState<boolean>(false);
  const { address, isConnected } = useAccount();
  const { chain } = useAccount();
  const [SwanBalance, setSwanBalance] = useState<number>(0);
  const [metaMastError, setMetaMaskError] = useState<string>("");
  const { connect } = useConnect();
  const { chains, switchChain } = useSwitchChain()

  const handleSwitchChain = async () => {
    try {
      await switchChain({ chainId: Number(process.env.NEXT_PUBLIC_L2_CHAIN_ID) });
      setMetaMaskError("")
    } catch (error) {
      if ((error as any).code === -32002) {
        setMetaMaskError("Request stuck in pending state")
      } else {
        console.error(error)
      }
    }
  }

  const { data } = useBalance({ address: address, chainId: Number(process.env.NEXT_PUBLIC_L2_CHAIN_ID) })
  const dataUSDT = useBalance({ address: address, token: `0x${process.env.NEXT_PUBLIC_L2_USDT}`, chainId: Number(process.env.NEXT_PUBLIC_L2_CHAIN_ID) })
  const dataDAI = useBalance({ address: address, token: `0x${process.env.NEXT_PUBLIC_L2_DAI}`, chainId: Number(process.env.NEXT_PUBLIC_L2_CHAIN_ID) })
  const dataUSDC = useBalance({ address: address, token: `0x${process.env.NEXT_PUBLIC_L2_USDC}`, chainId: Number(process.env.NEXT_PUBLIC_L2_CHAIN_ID) })
  const datawBTC = useBalance({ address: address, token: `0x${process.env.NEXT_PUBLIC_L2_wBTC}`, chainId: Number(process.env.NEXT_PUBLIC_L2_CHAIN_ID) })

  useEffect(() => {
    console.log("dataUSDT", data);
  }, []);

  ////========================================================== WITHDRAW =======================================================================

  const handleWithdraw = async () => {
    try {
      if (!ethValue) {
        setErrorInput("Please enter the amount");
      }
      else {
        if (parseFloat(ethValue) <= 0) {
          setErrorInput("Invalid Amount Entered!");
        } else {
          setErrorInput("");
          const l1Url = process.env.NEXT_PUBLIC_L1_RPC_URL;
          const l1Provider = new ethers.providers.JsonRpcProvider(l1Url, "any");
          const l2Provider = new ethers.providers.Web3Provider(window.ethereum);
          const l1Signer = l1Provider.getSigner(address)
          const l2Signer = l2Provider.getSigner(address)
          const zeroAddr = "0x".padEnd(42, "0");
          const l1Contracts = {
            StateCommitmentChain: zeroAddr,
            CanonicalTransactionChain: zeroAddr,
            BondManager: zeroAddr,
            AddressManager: process.env.NEXT_PUBLIC_LIB_ADDRESSMANAGER,
            L1CrossDomainMessenger: process.env.NEXT_PUBLIC_PROXY_OVM_L1CROSSDOMAINMESSENGER,
            L1StandardBridge: process.env.NEXT_PUBLIC_PROXY_OVM_L1STANDARDBRIDGE,
            OptimismPortal: process.env.NEXT_PUBLIC_OPTIMISM_PORTAL_PROXY,
            L2OutputOracle: process.env.NEXT_PUBLIC_L2_OUTPUTORACLE_PROXY,
          }
          const bridges = {
            Standard: {
              l1Bridge: l1Contracts.L1StandardBridge,
              l2Bridge: "0x4200000000000000000000000000000000000010",
              Adapter: optimismSDK.StandardBridgeAdapter
            },
            ETH: {
              l1Bridge: l1Contracts.L1StandardBridge,
              l2Bridge: "0x4200000000000000000000000000000000000010",
              Adapter: optimismSDK.ETHBridgeAdapter
            }
          }
          const crossChainMessenger = new optimismSDK.CrossChainMessenger({
            contracts: {
              l1: l1Contracts,
            },
            bridges: bridges,
            l1ChainId: Number(process.env.NEXT_PUBLIC_L1_CHAIN_ID),
            l2ChainId: Number(process.env.NEXT_PUBLIC_L2_CHAIN_ID),
            l1SignerOrProvider: l1Signer,
            l2SignerOrProvider: l2Signer,
            bedrock: true,
          })
          //-------------------------------------------------------- SEND TOKEN VALUE -----------------------------------------------------------------

          try {
            if (sendToken == "ETH") {
              const weiValue = parseInt(ethers.utils.parseEther(ethValue)._hex, 16)
              setLoader(true);
              const response = await crossChainMessenger.withdrawETH(weiValue.toString());
              const logs = await response.wait();
              if (logs) {
                setLoader(false);
                setEthValue("");
              }

            }
            if (sendToken == "DAI") {
              var daiValue = Web3.utils.toWei(ethValue, "ether")
              setLoader(true);
              var depositTxn2 = await crossChainMessenger.withdrawERC20(process.env.NEXT_PUBLIC_L1_DAI, process.env.NEXT_PUBLIC_L2_DAI, daiValue);;
              var receiptDAI = await depositTxn2.wait()
              if (receiptDAI) {
                setLoader(false);
                setEthValue("")
              }
            }

            if (sendToken == "USDT") {
              var usdtValue = parseInt(ethValue) * 1000000
              setLoader(true);
              var receiptUSDT = await crossChainMessenger.withdrawERC20(process.env.NEXT_PUBLIC_L1_USDT, process.env.NEXT_PUBLIC_L2_USDT, usdtValue)
              var getReceiptUSDT = await receiptUSDT.wait();
              if (getReceiptUSDT) {
                setLoader(false);
                setEthValue("")
              }
            }
            if (sendToken == "wBTC") {
              var wBTCValue = parseInt(ethValue) * 100000000
              setLoader(true);
              var receiptwBTC = await crossChainMessenger.withdrawERC20(process.env.NEXT_PUBLIC_L1_wBTC, process.env.NEXT_PUBLIC_L2_wBTC, wBTCValue)
              var getReceiptwBTC = await receiptwBTC.wait();
              if (getReceiptwBTC) {
                setLoader(false);
                setEthValue("")
              }
            }
            if (sendToken == "USDC") {
              var usdcValue = parseInt(ethValue) * 1000000
              setLoader(true);
              var receiptUSDC = await crossChainMessenger.withdrawERC20(process.env.NEXT_PUBLIC_L1_USDC, process.env.NEXT_PUBLIC_L2_USDC, usdcValue)
              var getReceiptUSDC = await receiptUSDC.wait();
              if (getReceiptUSDC) {
                setLoader(false);
                setEthValue("")
              }
            }
            //-------------------------------------------------------- SEND TOKEN VALUE END-----------------------------------------------------------------
            updateWallet()
          }
          catch (error: any) {
            setLoader(false);
            console.log({ error }, 98);
          }
        }
      }

    } catch (error: any) {
      console.log(error);
    }
  }


  ////========================================================== HANDLE CHANGE =======================================================================
  const [checkDisabled, setCheckDisabled] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (sendToken == "ETH") {
        if (data ?.value && Number(formatUnits(data.value, data.decimals)) < Number(e.target.value)) {
            setCheckDisabled(true)
            setErrorInput("Insufficient ETH balance.")
        } else {
            setCheckDisabled(false)
            setErrorInput("")
        }
        setEthValue(e.target.value)
    }
    if (sendToken == "DAI") {
        if (dataDAI.data ?.value && Number(formatUnits(dataDAI.data.value, dataDAI.data.decimals)) < Number(e.target.value)) {
            setCheckDisabled(true)
            setErrorInput("Insufficient DAI balance.")
        } else {
            setCheckDisabled(false)
            setErrorInput("")
        }
        setEthValue(e.target.value)
    }
    if (sendToken == "USDT") {
        if (dataUSDT.data ?.value && Number(formatUnits(dataUSDT.data.value, dataUSDT.data.decimals)) < Number(e.target.value)) {
            setCheckDisabled(true);
            setErrorInput("Insufficient USDT balance.");
        } else {
            setCheckDisabled(false);
            setErrorInput("");
        }
        setEthValue(e.target.value);
    }

    if (sendToken == "wBTC") {
        if (datawBTC.data ?.value && Number(formatUnits(datawBTC.data.value, datawBTC.data.decimals)) < Number(e.target.value)) {
            setCheckDisabled(true);
            setErrorInput("Insufficient wBTC balance.");
        } else {
            setCheckDisabled(false);
            setErrorInput("");
        }
        setEthValue(e.target.value);
    }

    if (sendToken == "USDC") {
        if (dataUSDC.data ?.value && Number(formatUnits(dataUSDC.data.value, dataUSDC.data.decimals)) < Number(e.target.value)) {
            setCheckDisabled(true);
            setErrorInput("Insufficient USDC balance.");
        } else {
            setCheckDisabled(false);
            setErrorInput("");
        }
        setEthValue(e.target.value);
    }
}

  // ============= For Format balance =========================
  const formatBalance = (rawBalance: string) => {
    const balance = (parseInt(rawBalance) / 1000000000000000000).toFixed(6)
    return balance
  }
  // ============= Get and update balance =========================
  const updateWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      const balance = formatBalance(await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"]
      }))
      setSwanBalance(Number(balance));
    } else {
      console.error('Ethereum provider is not available');
    }
  }

  useEffect(() => {
    updateWallet()

  }, [data])
  return (
    <>
      <div className='bridge_wrap'>
        <TabMenu />
        <section className='deposit_wrap'>
          <div className='withdraw_title_wrap'>
            <div className='withdraw_title_icn'>
              <MdOutlineSecurity />
            </div>
            <div className='withdraw_title_content'>
              <h3>Use the official bridge</h3>
              <p>This usually takes 7 days</p>
              <p>Bridge any token to Ethereum Mainnet</p>
            </div>
          </div>
          <div className='deposit_price_wrap'>
            <div className='deposit_price_title'>
              <p>From</p>
              <h5 className="flex-row"><Image src={toIcn.src} alt="To icn" fluid /> Swan</h5>
            </div>
            <div className='deposit_input_wrap'>
              <Form>
                <div className='deposit_inner_input'>
                  <Form.Control type='number' name="eth_value" value={ethValue} onChange={handleChange} placeholder="0" min="0" step="any" />
                  <Form.Select aria-label="Default select example" className='select_wrap' onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setSendToken(event.target.value)}>
                    <option>ETH</option>
                    <option value="DAI">DAI</option>
                    <option value="USDT">USDT</option>
                    <option value="wBTC">wBTC</option>
                    <option value="USDC">USDC</option>
                  </Form.Select>
                </div>
                <div className='input_icn_wrap'>
                  {sendToken == "ETH" ? <span className='input_icn flex-row'><Ethereum style={{ fontSize: '1.5rem' }} /></span> : sendToken == "DAI" ? <span className='input_icn flex-row'><Dai style={{ fontSize: '1.5rem' }} /></span> : sendToken == "USDT" ? <span className='input_icn flex-row'><Usdt style={{ fontSize: '1.5rem' }} /></span> : sendToken == "wBTC" ? <span className='input_icn flex-row'><Btc style={{ fontSize: '1.5rem' }} /></span> : <span className='input_icn flex-row'><Usdc style={{ fontSize: '1.5rem' }} /></span>}
                </div>
              </Form>
            </div>
            {errorInput && <small className='text-danger'>{errorInput}</small>}
            {sendToken === "ETH" ? address && <p className='wallet_bal mt-2'>Balance: {Number(data ?.formatted).toFixed(5)} ETH</p> : sendToken === "DAI" ? address && <p className='wallet_bal mt-2'>Balance: {Number(dataDAI.data ?.formatted).toFixed(5)} DAI</p> : sendToken == "USDT" ? address && <p className='wallet_bal mt-2'>Balance: {Number(dataUSDT.data ?.formatted).toFixed(5)} USDT</p> : sendToken === "wBTC" ? address && <p className='wallet_bal mt-2'>Balance: {Number(datawBTC.data ?.formatted).toFixed(5)} wBTC</p> : <p className='wallet_bal mt-2'>Balance: {Number(dataUSDC.data ?.formatted).toFixed(5)} USDC</p>}
          </div>
          <div className='up flex-row center'>
            <svg width="17" height="19" viewBox="0 0 17 19" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8.5 17.4736L15 11.0696M8.5 17.4736L2 11.0696M8.5 17.4736V1.5" stroke="#447DFF" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <div className='deposit_details_wrap'>
            <div className="deposit_details flex-row">
              <p>To:</p>
              <h5 className="flex-row"><FaEthereum /> Sepolia Testnet</h5>
            </div>
            <div className='withdraw_bal_sum'>
              {sendToken == "ETH" ? <span className='input_icn flex-row'><Ethereum style={{ fontSize: '1.5rem' }} /></span> : sendToken == "DAI" ? <span className='input_icn flex-row'><Dai style={{ fontSize: '1.5rem' }} /></span> : sendToken == "USDT" ? <span className='input_icn flex-row'><Usdt style={{ fontSize: '1.5rem' }} /></span> : sendToken == "wBTC" ? <span className='input_icn flex-row'><Btc style={{ fontSize: '1.5rem' }} /></span> : <span className='input_icn flex-row'><Usdc style={{ fontSize: '1.5rem' }} /></span>}
              <p>You’ll receive: {ethValue ? ethValue : "0"} {sendToken}</p>
              <div></div>
              {/* <span className='input_title'>ETH</span> */}
            </div>
          </div>
          <div className="deposit_btn_wrap">
            {checkMetaMask === true ? <a className='btn deposit_btn flex-row' href='https://metamask.io/' target='_blank'><NextImage src="/assets/images/metamask.svg" alt="metamask icn" layout="responsive" width={500} height={300} />  Please Install Metamask Wallet</a> : !isConnected ? <button className='btn deposit_btn flex-row' onClick={() => connect({ connector: injected() })}><IoMdWallet />Connect Wallet</button> : chain && chain.id !== Number(process.env.NEXT_PUBLIC_L2_CHAIN_ID) ? <button className='btn deposit_btn flex-row'
              onClick={() => switchChain({ chainId: 90001 })}><HiSwitchHorizontal />Switch to SWAN Testnet</button> :
              checkDisabled ? <button className='btn deposit_btn flex-row' disabled={true}>Withdraw</button> :
                <button className='btn deposit_btn flex-row' onClick={handleWithdraw} disabled={loader ? true : false}>{loader ? <Spinner animation="border" role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner> : "Withdraw"}</button>}
          </div>
          {metaMastError && <small className="d-block text-danger text-center mt-2">{metaMastError}</small>}
        </section>
      </div>
    </>
  )
}

export default Withdraw

