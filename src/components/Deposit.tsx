import React, { useState, useEffect } from 'react';
import { Form, Image, Spinner } from "react-bootstrap"
import { Dai, Usdt, Usdc, Ethereum, Btc } from 'react-web3-icons';
import toIcn from "../assets/images/logo.png"
import { IoMdWallet } from "react-icons/io"
import { FaEthereum } from "react-icons/fa"
import { useAccount, useConnect, useSwitchChain, useConfig, useBalance } from 'wagmi'
import { injected } from 'wagmi/connectors'
import TabMenu from './TabMenu';
import { HiSwitchHorizontal } from "react-icons/hi"
import metamask from "../assets/images/metamask.svg"
import Web3 from 'web3';
import { FC } from 'react';
const optimismSDK = require("@eth-optimism/sdk")
const ethers = require("ethers")


const Deposit: React.FC = () => {
    const [ethValue, setEthValue] = useState<string>("")
    const [sendToken, setSendToken] = useState<string>("ETH")
    const { address, isConnected } = useAccount()
    const [errorInput, setErrorInput] = useState<string>("")
    const [loader, setLoader] = useState<boolean>(false)
    const { chain } = useAccount();
    const [checkMetaMask, setCheckMetaMask] = useState<string>("");
    const { connect } = useConnect();
    const { chains, switchChain } = useSwitchChain()

    const { data } = useBalance({ address: address, chainId: Number(process.env.NEXT_PUBLIC_L1_CHAIN_ID) })


    const dataUSDT = useBalance({ address: address, token: `0x${process.env.NEXT_PUBLIC_L1_USDT}`, chainId: Number(process.env.NEXT_PUBLIC_L1_CHAIN_ID) })
    const dataDAI = useBalance({ address: address, token: `0x${process.env.NEXT_PUBLIC_L1_DAI}`, chainId: Number(process.env.NEXT_PUBLIC_L1_CHAIN_ID) })
    const dataUSDC = useBalance({ address: address, token: `0x${process.env.NEXT_PUBLIC_L1_USDC}`, chainId: Number(process.env.NEXT_PUBLIC_L1_CHAIN_ID) })
    const datawBTC = useBalance({ address: address, token: `0x${process.env.NEXT_PUBLIC_L1_wBTC}`, chainId: Number(process.env.NEXT_PUBLIC_L1_CHAIN_ID) })


    const handleDeposit = async () => {
        try {
            if (!ethValue) {
                setErrorInput("Please enter the amount");
            }
            else {
                if (!(parseFloat(ethValue) > 0)) {
                    setErrorInput("Invalid Amount Entered!");
                } else {
                    const l2Url = process.env.NEXT_PUBLIC_L2_RPC_URL;
                    const l1Provider = new ethers.providers.Web3Provider(window.ethereum);
                    const l2Provider = new ethers.providers.JsonRpcProvider(l2Url, 'any')
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
                            l2Bridge: process.env.NEXT_PUBLIC_L2_BRIDGE,
                            Adapter: optimismSDK.StandardBridgeAdapter
                        },
                        ETH: {
                            l1Bridge: l1Contracts.L1StandardBridge,
                            l2Bridge: process.env.NEXT_PUBLIC_L2_BRIDGE,
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
                    if (sendToken === "ETH") {
                        console.log(sendToken);
                        const weiValue = parseInt(ethers.utils.parseEther(ethValue)._hex, 16)
                        setLoader(true);
                        var depositETHEREUM = await crossChainMessenger.depositETH(weiValue.toString())
                        const receiptETH = await depositETHEREUM.wait()
                        if (receiptETH) {
                            setLoader(false);
                            setEthValue("")
                        }
                    }
                    if (sendToken === "DAI") {
                        var daiValue = Web3.utils.toWei(ethValue, "ether")
                        setLoader(true);
                        console.log("adddresssssssssss", process.env.NEXT_PUBLIC_L1_DAI)
                        var depositTxn2 = await crossChainMessenger.approveERC20(process.env.NEXT_PUBLIC_L1_DAI, process.env.NEXT_PUBLIC_L2_DAI, daiValue)
                        await depositTxn2.wait()
                        var receiptDAI = await crossChainMessenger.depositERC20(process.env.NEXT_PUBLIC_L1_DAI, process.env.NEXT_PUBLIC_L2_DAI, daiValue)
                        var getReceiptDAI = await receiptDAI.wait()
                        if (getReceiptDAI) {
                            setLoader(false);
                            setEthValue("")
                        }
                    }
                    if (sendToken === "USDT") {
                        var usdtValue = parseInt(ethValue)* 1000000
                        setLoader(true);
                        var depositTxn1 = await crossChainMessenger.approveERC20(process.env.NEXT_PUBLIC_L1_USDT, process.env.NEXT_PUBLIC_L2_USDT, usdtValue)
                        await depositTxn1.wait()
                        var receiptUSDT = await crossChainMessenger.depositERC20(process.env.NEXT_PUBLIC_L1_USDT, process.env.NEXT_PUBLIC_L2_USDT, usdtValue)
                        var getReceiptUSDT = await receiptUSDT.wait()
                        if (getReceiptUSDT) {
                            setLoader(false);
                            setEthValue("")
                        }
                    }
                    if (sendToken === "wBTC") {
                        var wBTCValue = parseInt(ethValue) * 100000000
                        setLoader(true);
                        var depositTxnBtc = await crossChainMessenger.approveERC20(process.env.NEXT_PUBLIC_L1_wBTC, process.env.NEXT_PUBLIC_L2_wBTC, wBTCValue)
                        await depositTxnBtc.wait()
                        var receiptwBTC = await crossChainMessenger.depositERC20(process.env.NEXT_PUBLIC_L1_wBTC, process.env.NEXT_PUBLIC_L2_wBTC, wBTCValue)
                        var getReceiptwBTC = await receiptwBTC.wait()
                        if (getReceiptwBTC) {
                            setLoader(false);
                            setEthValue("")
                        }
                    }
                    if (sendToken === "USDC") {
                        var usdcValue = parseInt(ethValue) * 1000000
                        setLoader(true);
                        var depositTxn3 = await crossChainMessenger.approveERC20(process.env.NEXT_PUBLIC_L1_USDC, process.env.NEXT_PUBLIC_L2_USDC, usdcValue)
                        await depositTxn3.wait()
                        var receiptUSDC = await crossChainMessenger.depositERC20(process.env.NEXT_PUBLIC_L1_USDC, process.env.NEXT_PUBLIC_L2_USDC, usdcValue)
                        var getReceiptUSDC = await receiptUSDC.wait()
                        if (getReceiptUSDC) {
                            setLoader(false);
                            setEthValue("")
                        }
                    }


                }
            }
        } catch (error) {
            console.log(error)
            setLoader(false);
        }
    }
    const [checkDisabled, setCheckDisabled] = useState(false)
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (sendToken == 'ETH') {
            if (Number(ethers.utils.formatEther(data?.value)) < Number(e.target.value)) {
                setErrorInput("Insufficient ETH balance.")
                setCheckDisabled(true)
            } else {
                setCheckDisabled(false)
                setErrorInput("")
            }
            setEthValue(e.target.value)
        }
        if (sendToken == 'DAI') {
            if (Number(ethers.utils.formatEther(dataDAI.data?.value)) < Number(e.target.value)) {
                setErrorInput("Insufficient DAI balance.")
                setCheckDisabled(true)
            } else {
                setCheckDisabled(false)
                setErrorInput("")
            }
            setEthValue(e.target.value)
        }
        if (sendToken == 'USDT') {
            if (Number(ethers.utils.formatEther(dataUSDT.data?.value)) < Number(e.target.value)) {
                setErrorInput("Insufficient USDT balance.")
                setCheckDisabled(true)
            } else {
                setCheckDisabled(false)
                setErrorInput("")
            }
            setEthValue(e.target.value)
        }
        if (sendToken == 'wBTC') {
            if (Number(ethers.utils.formatEther(datawBTC.data?.value)) < Number(e.target.value)) {
                setErrorInput("Insufficient wBTC balance.")
                setCheckDisabled(true)
            } else {
                setCheckDisabled(false)
                setErrorInput("")
            }
            setEthValue(e.target.value)
        }
        if (sendToken == 'USDC') {
            if (Number(ethers.utils.formatEther(dataUSDC.data?.value) < Number(e.target.value))) {
                setErrorInput("Insufficient USDC balance.")
                setCheckDisabled(true)
            } else {
                setErrorInput("")
                setCheckDisabled(false)
            }
            setEthValue(e.target.value)
        }

    }

    return (
        <>
            <div className='bridge_wrap'>
                <TabMenu />
                <section className='deposit_wrap'>
                    <div className='deposit_price_wrap'>
                        <div className='deposit_price_title'>
                            <p>From</p>
                            <h5><FaEthereum /> Sepolia Testnet</h5>
                        </div>
                        <div className='deposit_input_wrap'>
                            <Form>
                                <div className='deposit_inner_input'>
                                    <Form.Control type='number' value={ethValue} onChange={handleChange} placeholder="0" min="0" step="any" />
                                    <Form.Select aria-label="Default select example" className='select_wrap' onChange={({ target }) => setSendToken(target.value)}>
                                        <option>ETH</option>
                                        <option value="DAI">DAI</option>
                                        <option value="USDC">USDC</option>
                                        <option value="USDT">USDT</option>
                                        <option value="wBTC">wBTC</option>
                                    </Form.Select>
                                </div>
                                <div className='input_icn_wrap'>
                                    {sendToken == "ETH" ? <span className='input_icn'><Ethereum style={{ fontSize: '1.5rem' }} /></span> : sendToken == "DAI" ? <span className='input_icn'><Dai style={{ fontSize: '1.5rem' }} /></span> : sendToken == "USDT" ? <span className='input_icn'><Usdt style={{ fontSize: '1.5rem' }} /></span> : sendToken == "wBTC" ? <span className='input_icn'><Btc style={{ fontSize: '1.5rem' }} /></span> : <span className='input_icn'><Usdc style={{ fontSize: '1.5rem' }} /></span>}
                                </div>
                            </Form>
                        </div>
                        {errorInput && <small className='text-danger'>{errorInput}</small>}
                        {sendToken == 'ETH' ? address && <p className='wallet_bal mt-2'>Balance: {Number(data?.formatted).toFixed(5)} ETH</p> : sendToken == 'USDT' ? address && <p className='wallet_bal mt-2'>Balance: {Number(dataUSDT.data?.formatted).toFixed(5)} USDT</p> : sendToken == 'DAI' ? address && <p className='wallet_bal mt-2'>Balance: {Number(dataDAI.data?.formatted).toFixed(5)} DAI</p> : sendToken == 'wBTC' ? address && <p className='wallet_bal mt-2'>Balance: {Number(datawBTC.data?.formatted).toFixed(5)} wBTC</p> : address && <p className='wallet_bal mt-2'>Balance: {Number(dataUSDC.data?.formatted).toFixed(5)} USDC</p>}

                    </div>
                    <div className='deposit_details_wrap'>
                        <div className="deposit_details">
                            <p>To</p>
                            <h5><Image src={toIcn.toString()} alt="To icn" fluid/> Swan</h5>
                        </div>
                        <div className='deposit_inner_details'>
                            {sendToken == "ETH" ? <span className='input_icn'> <Ethereum style={{ fontSize: '1.5rem' }} /></span> : sendToken == "DAI" ? <span className='input_icn'><Dai style={{ fontSize: '1.5rem' }} /></span> : sendToken == "USDT" ? <span className='input_icn'> <Usdt style={{ fontSize: '1.5rem' }} /></span> : sendToken == "wBTC" ? <span className='input_icn'> <Btc style={{ fontSize: '1.5rem' }} /></span> : <span className='input_icn'> <Usdc style={{ fontSize: '1.5rem' }} /></span>}  <p> You’ll receive: {ethValue ? ethValue : "0"} {sendToken}</p>
                        </div>
                    </div>
                    <div className="deposit_btn_wrap">
                        {checkMetaMask === 'true' ? <a className='btn deposit_btn' href='https://metamask.io/' target='_blank'><Image src={metamask} alt="metamask icn" fluid/> Please Install Metamask Wallet</a> : !isConnected ? <button className='btn deposit_btn' onClick={() => connect({connector: injected() })}><IoMdWallet />Connect Wallet</button> : Number(chain?.id) !== Number(process.env.NEXT_PUBLIC_L1_CHAIN_ID) ? <button className='btn deposit_btn' onClick={() => switchChain({ chainId: Number(process.env.NEXT_PUBLIC_L1_CHAIN_ID)})}><HiSwitchHorizontal />Switch to Sepolia</button> :
                            checkDisabled ? <button className='btn deposit_btn' disabled={true}>Deposit</button> :
                                <button className='btn deposit_btn' onClick={handleDeposit} disabled={loader ? true : false}> {loader ? <Spinner animation="border" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </Spinner> : "Deposit"} </button>}
                    </div>
                </section>
            </div>
        </>
    )
}

export default Deposit
