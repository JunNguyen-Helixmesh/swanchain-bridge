import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Image, Spinner, Modal, Button } from "react-bootstrap";
import { Dai, Usdt, Usdc, Ethereum, Btc } from "react-web3-icons";
import toIcn from "../assets/images/swantoken.png";
import { IoMdWallet } from "react-icons/io";
import { FaEthereum } from "react-icons/fa";
import {
  useAccount,
  useConnect,
  useSwitchChain,
  useConfig,
  useBalance,
  useChainId,
} from "wagmi";
import { injected } from "wagmi/connectors";
import TabMenu from "./TabMenu";
import { HiSwitchHorizontal } from "react-icons/hi";
import Web3 from "web3";
import NextImage from "next/image";
import { FC } from "react";
import { formatUnits } from "viem";
const optimismSDK = require("@eth-optimism/sdk");
const ethers = require("ethers");

const Deposit: React.FC = () => {
  const [ethValue, setEthValue] = useState<string>("");
  const [sendToken, setSendToken] = useState<string>("ETH");
  const { address, isConnected } = useAccount();
  const [errorInput, setErrorInput] = useState<string>("");
  const [loader, setLoader] = useState<boolean>(false);
  const [SepoliaBalance, setSepoliaBalance] = useState<number>(0);
  const { chain } = useAccount();
  const [checkMetaMask, setCheckMetaMask] = useState<string>("");
  const { connect } = useConnect();
  const { chains, switchChain } = useSwitchChain();
  const [showModal, setShowModal] = useState(false);
  const [balance, setBalance] = useState<string>("");
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const chainId = useChainId();
  const { data } = useBalance({
    address: address,
    chainId: Number(process.env.NEXT_PUBLIC_L1_CHAIN_ID),
  });

  const dataUSDT = useBalance({
    address: address,
    token: `0x${process.env.NEXT_PUBLIC_L1_USDT}`,
    chainId: Number(process.env.NEXT_PUBLIC_L1_CHAIN_ID),
  });
  const dataDAI = useBalance({
    address: address,
    token: `0x${process.env.NEXT_PUBLIC_L1_DAI}`,
    chainId: Number(process.env.NEXT_PUBLIC_L1_CHAIN_ID),
  });
  const dataUSDC = useBalance({
    address: address,
    token: `0x${process.env.NEXT_PUBLIC_L1_USDC}`,
    chainId: Number(process.env.NEXT_PUBLIC_L1_CHAIN_ID),
  });
  const datawBTC = useBalance({
    address: address,
    token: `0x${process.env.NEXT_PUBLIC_L1_wBTC}`,
    chainId: Number(process.env.NEXT_PUBLIC_L1_CHAIN_ID),
  });

  const handleDeposit = async () => {
    try {
      if (!ethValue) {
        setErrorInput("Please enter the amount");
      } else {
        if (!(parseFloat(ethValue) > 0)) {
          setErrorInput("Invalid Amount Entered!");
        } else {
          const l2Url = process.env.NEXT_PUBLIC_L2_RPC_URL;
          const l1Provider = new ethers.providers.Web3Provider(window.ethereum);
          const l2Provider = new ethers.providers.JsonRpcProvider(l2Url, "any");
          const l1Signer = l1Provider.getSigner(address);
          const l2Signer = l2Provider.getSigner(address);
          const zeroAddr = "0x".padEnd(42, "0");
          const l1Contracts = {
            StateCommitmentChain: zeroAddr,
            CanonicalTransactionChain: zeroAddr,
            BondManager: zeroAddr,
            AddressManager: process.env.NEXT_PUBLIC_LIB_ADDRESSMANAGER,
            L1CrossDomainMessenger:
              process.env.NEXT_PUBLIC_PROXY_OVM_L1CROSSDOMAINMESSENGER,
            L1StandardBridge:
              process.env.NEXT_PUBLIC_PROXY_OVM_L1STANDARDBRIDGE,
            OptimismPortal: process.env.NEXT_PUBLIC_OPTIMISM_PORTAL_PROXY,
            L2OutputOracle: process.env.NEXT_PUBLIC_L2_OUTPUTORACLE_PROXY,
          };
          const bridges = {
            Standard: {
              l1Bridge: l1Contracts.L1StandardBridge,
              l2Bridge: process.env.NEXT_PUBLIC_L2_BRIDGE,
              Adapter: optimismSDK.StandardBridgeAdapter,
            },
            ETH: {
              l1Bridge: l1Contracts.L1StandardBridge,
              l2Bridge: process.env.NEXT_PUBLIC_L2_BRIDGE,
              Adapter: optimismSDK.ETHBridgeAdapter,
            },
          };
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
          });
          if (sendToken === "ETH") {
            console.log(sendToken);
            const weiValue = parseInt(
              ethers.utils.parseEther(ethValue)._hex,
              16
            );
            setLoader(true);
            var depositETHEREUM = await crossChainMessenger.depositETH(
              weiValue.toString()
            );
            const receiptETH = await depositETHEREUM.wait();
            if (receiptETH) {
              setLoader(false);
              setEthValue("");
              // await callGalxeAPI();
              setTimeout(fetchBalance, 3000);
            }
          }
          if (sendToken === "DAI") {
            var daiValue = Web3.utils.toWei(ethValue, "ether");
            setLoader(true);
            console.log("adddresssssssssss", process.env.NEXT_PUBLIC_L1_DAI);
            var depositTxn2 = await crossChainMessenger.approveERC20(
              process.env.NEXT_PUBLIC_L1_DAI,
              process.env.NEXT_PUBLIC_L2_DAI,
              daiValue
            );
            await depositTxn2.wait();
            var receiptDAI = await crossChainMessenger.depositERC20(
              process.env.NEXT_PUBLIC_L1_DAI,
              process.env.NEXT_PUBLIC_L2_DAI,
              daiValue
            );
            var getReceiptDAI = await receiptDAI.wait();
            if (getReceiptDAI) {
              setLoader(false);
              setEthValue("");
              //  await callGalxeAPI();
            }
          }
          if (sendToken === "USDT") {
            var usdtValue = parseInt(ethValue) * 1000000;
            setLoader(true);
            var depositTxn1 = await crossChainMessenger.approveERC20(
              process.env.NEXT_PUBLIC_L1_USDT,
              process.env.NEXT_PUBLIC_L2_USDT,
              usdtValue
            );
            await depositTxn1.wait();
            var receiptUSDT = await crossChainMessenger.depositERC20(
              process.env.NEXT_PUBLIC_L1_USDT,
              process.env.NEXT_PUBLIC_L2_USDT,
              usdtValue
            );
            var getReceiptUSDT = await receiptUSDT.wait();
            if (getReceiptUSDT) {
              setLoader(false);
              setEthValue("");
              //await callGalxeAPI();
            }
          }
          if (sendToken === "wBTC") {
            var wBTCValue = parseInt(ethValue) * 100000000;
            setLoader(true);
            var depositTxnBtc = await crossChainMessenger.approveERC20(
              process.env.NEXT_PUBLIC_L1_wBTC,
              process.env.NEXT_PUBLIC_L2_wBTC,
              wBTCValue
            );
            await depositTxnBtc.wait();
            var receiptwBTC = await crossChainMessenger.depositERC20(
              process.env.NEXT_PUBLIC_L1_wBTC,
              process.env.NEXT_PUBLIC_L2_wBTC,
              wBTCValue
            );
            var getReceiptwBTC = await receiptwBTC.wait();
            if (getReceiptwBTC) {
              setLoader(false);
              setEthValue("");
              //await callGalxeAPI();
            }
          }
          if (sendToken === "USDC") {
            var usdcValue = parseInt(ethValue) * 1000000;
            setLoader(true);
            var depositTxn3 = await crossChainMessenger.approveERC20(
              process.env.NEXT_PUBLIC_L1_USDC,
              process.env.NEXT_PUBLIC_L2_USDC,
              usdcValue
            );
            await depositTxn3.wait();
            var receiptUSDC = await crossChainMessenger.depositERC20(
              process.env.NEXT_PUBLIC_L1_USDC,
              process.env.NEXT_PUBLIC_L2_USDC,
              usdcValue
            );
            var getReceiptUSDC = await receiptUSDC.wait();
            if (getReceiptUSDC) {
              setLoader(false);
              setEthValue("");
              //await callGalxeAPI();
            }
          }
        }
      }
    } catch (error: any) {
      setLoader(false);
      console.log({ error }, 98);
    } finally {
      setLoader(false);
      fetchBalance();
    }
  };
  const [checkDisabled, setCheckDisabled] = useState(false);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (sendToken == "ETH") {
      if (
        data?.value &&
        Number(formatUnits(data.value, data.decimals)) < Number(e.target.value)
      ) {
        setCheckDisabled(true);
        setErrorInput("Insufficient ETH balance.");
      } else {
        setCheckDisabled(false);
        setErrorInput("");
      }
      setEthValue(e.target.value);
    }
    if (sendToken == "DAI") {
      if (
        dataDAI.data?.value &&
        Number(formatUnits(dataDAI.data.value, dataDAI.data.decimals)) <
          Number(e.target.value)
      ) {
        setCheckDisabled(true);
        setErrorInput("Insufficient DAI balance.");
      } else {
        setCheckDisabled(false);
        setErrorInput("");
      }
      setEthValue(e.target.value);
    }
    if (sendToken == "USDT") {
      if (
        dataUSDT.data?.value &&
        Number(formatUnits(dataUSDT.data.value, dataUSDT.data.decimals)) <
          Number(e.target.value)
      ) {
        setCheckDisabled(true);
        setErrorInput("Insufficient USDT balance.");
      } else {
        setCheckDisabled(false);
        setErrorInput("");
      }
      setEthValue(e.target.value);
    }

    if (sendToken == "wBTC") {
      if (
        datawBTC.data?.value &&
        Number(formatUnits(datawBTC.data.value, datawBTC.data.decimals)) <
          Number(e.target.value)
      ) {
        setCheckDisabled(true);
        setErrorInput("Insufficient wBTC balance.");
      } else {
        setCheckDisabled(false);
        setErrorInput("");
      }
      setEthValue(e.target.value);
    }

    if (sendToken == "USDC") {
      if (
        dataUSDC.data?.value &&
        Number(formatUnits(dataUSDC.data.value, dataUSDC.data.decimals)) <
          Number(e.target.value)
      ) {
        setCheckDisabled(true);
        setErrorInput("Insufficient USDC balance.");
      } else {
        setCheckDisabled(false);
        setErrorInput("");
      }
      setEthValue(e.target.value);
    }
  };
  // ============= For Format balance =========================
  const formatBalance = (rawBalance: string) => {
    const balance = (parseInt(rawBalance) / 1000000000000000000).toFixed(6);
    return balance;
  };
  // ============= Get and update balance =========================
  const updateWallet = async () => {
    if (typeof window.ethereum !== "undefined") {
      const balance = formatBalance(
        await window.ethereum.request({
          method: "eth_getBalance",
          params: [address, "latest"],
        })
      );
      setSepoliaBalance(Number(balance));
    } else {
      console.error("Ethereum provider is not available");
    }
  };

  const fetchBalance = async () => {
    if (address) {
      const web3 = new Web3(window.ethereum);
      const balance = await web3.eth.getBalance(address);
      const balanceInEther = web3.utils.fromWei(balance, "ether");
      const formattedBalance = parseFloat(balanceInEther).toFixed(6);
      setBalance(formattedBalance);
    }
  };

  useEffect(() => {
    updateWallet();
  }, [data]);

  useEffect(() => {
    console.log("Network changed:", chainId);
  }, [chainId]);
  useEffect(() => {
    const ethereum = window.ethereum;

    if (ethereum && ethereum.on && ethereum.removeListener) {
      const handleChainChanged = async () => {
        await fetchBalance();
      };

      ethereum.on("chainChanged", handleChainChanged);

      return () => {
        ethereum.removeListener("chainChanged", handleChainChanged);
      };
    }
  }, [fetchBalance]);

  useEffect(() => {
    fetchBalance();
  }, [address]);
  return (
    <>
      <div className="bridge_wrap">
        <TabMenu />
        <section className="deposit_wrap">
          <div className="deposit_price_wrap">
            <div className="deposit_price_title">
              <p>From</p>
              <h5 className="flex-row">
                <FaEthereum /> Ethereum Mainnet
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
                    <option value="DAI">DAI</option>
                    <option value="USDC">USDC</option>
                    <option value="USDT">USDT</option>
                    <option value="wBTC">wBTC</option>
                  </Form.Select>
                </div>
                <div className="input_icn_wrap">
                  {sendToken == "ETH" ? (
                    <span className="input_icn flex-row">
                      <Ethereum style={{ fontSize: "1.5rem" }} />
                    </span>
                  ) : sendToken == "DAI" ? (
                    <span className="input_icn flex-row">
                      <Dai style={{ fontSize: "1.5rem" }} />
                    </span>
                  ) : sendToken == "USDT" ? (
                    <span className="input_icn flex-row">
                      <Usdt style={{ fontSize: "1.5rem" }} />
                    </span>
                  ) : sendToken == "wBTC" ? (
                    <span className="input_icn flex-row">
                      <Btc style={{ fontSize: "1.5rem" }} />
                    </span>
                  ) : (
                    <span className="input_icn flex-row">
                      <Usdc style={{ fontSize: "1.5rem" }} />
                    </span>
                  )}
                </div>
              </Form>
            </div>
            {errorInput && <small className="text-danger">{errorInput}</small>}
            {sendToken === "ETH" ? (
              address && (
                <p className="wallet_bal mt-2">Balance: {balance} ETH</p>
              )
            ) : sendToken === "DAI" ? (
              address && (
                <p className="wallet_bal mt-2">
                  Balance:{" "}
                  {dataDAI?.data?.value !== undefined &&
                    dataDAI?.data?.value !== BigInt(0) &&
                    Number(
                      formatUnits(dataDAI.data!.value, dataDAI.data!.decimals)
                    ).toFixed(5)}{" "}
                  DAI
                </p>
              )
            ) : sendToken == "USDT" ? (
              address && (
                <p className="wallet_bal mt-2">
                  Balance:{" "}
                  {dataUSDT?.data?.value !== undefined &&
                    dataUSDT?.data?.value !== BigInt(0) &&
                    Number(
                      formatUnits(dataUSDT.data!.value, dataUSDT.data!.decimals)
                    ).toFixed(5)}{" "}
                  USDT
                </p>
              )
            ) : sendToken === "wBTC" ? (
              address && (
                <p className="wallet_bal mt-2">
                  Balance:{" "}
                  {datawBTC?.data?.value !== undefined &&
                    datawBTC?.data?.value !== BigInt(0) &&
                    Number(
                      formatUnits(datawBTC.data!.value, datawBTC.data!.decimals)
                    ).toFixed(5)}{" "}
                  wBTC
                </p>
              )
            ) : (
              <p className="wallet_bal mt-2">
                Balance:{" "}
                {dataUSDC?.data?.value !== undefined &&
                  dataUSDC?.data?.value !== BigInt(0) &&
                  Number(
                    formatUnits(dataUSDC.data!.value, dataUSDC.data!.decimals)
                  ).toFixed(5)}{" "}
                USDC
              </p>
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
              <p>To</p>
              <h5 className="flex-row">
                <Image src={toIcn.src} alt="To icn" fluid /> Swan
              </h5>
            </div>
            <div className="deposit_inner_details flex-row">
              {sendToken == "ETH" ? (
                <span className="input_icn flex-row">
                  {" "}
                  <Ethereum style={{ fontSize: "1.5rem" }} />
                </span>
              ) : sendToken == "DAI" ? (
                <span className="input_icn flex-row">
                  <Dai style={{ fontSize: "1.5rem" }} />
                </span>
              ) : sendToken == "USDT" ? (
                <span className="input_icn flex-row">
                  {" "}
                  <Usdt style={{ fontSize: "1.5rem" }} />
                </span>
              ) : sendToken == "wBTC" ? (
                <span className="input_icn flex-row">
                  {" "}
                  <Btc style={{ fontSize: "1.5rem" }} />
                </span>
              ) : (
                <span className="input_icn flex-row">
                  {" "}
                  <Usdc style={{ fontSize: "1.5rem" }} />
                </span>
              )}{" "}
              <p>
                {" "}
                You’ll receive: {ethValue ? ethValue : "0"} {sendToken}
              </p>
            </div>
          </div>
          <div
            className="deposit_btn_wrap"
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <p
              style={{
                color: "#ffffff",
                fontSize: "0.8rem",
                textAlign: "center",
                marginTop: "0px",
                marginBottom: "20px",
              }}
            >
              Please ensure you are connected to MetaMask & the Ethereum
              Mainnet.
            </p>
            {checkMetaMask === "true" ? (
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
              <button
                className="btn deposit_btn flex-row"
                onClick={() => {
                  setIsWalletModalOpen(true);
                }}
              >
                <IoMdWallet />
                Connect Wallet
              </button>
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
                Switch to Ethereum
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
                  "Deposit"
                )}
              </button>
            )}
          </div>{" "}
          {showModal && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 999,
              }}
              onClick={() => setShowModal(false)}
            />
          )}
          <Modal
            show={showModal}
            onHide={() => setShowModal(false)}
            centered
            style={{
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 1000,
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "10px",
                maxWidth: "500px",
                width: "100%",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ padding: "20px", color: "black" }}>
                <h2>Install MetaMask</h2>
                <p style={{ marginBottom: "20px" }}>
                  You need to install MetaMask to use this application. Click
                  the button below to install it.
                </p>
                <a
                  href="https://metamask.io/"
                  target="_blank"
                  style={{
                    color: "white",
                    backgroundColor: "#447dff",
                    padding: "10px 20px",
                    borderRadius: "5px",
                    textDecoration: "none",
                    marginTop: "20px",
                  }}
                >
                  Install MetaMask
                </a>
              </div>
            </div>
          </Modal>
          {isWalletModalOpen && (
            <div
              style={{
                position: "fixed",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                zIndex: 1000,
              }}
              onClick={() => setIsWalletModalOpen(false)}
            />
          )}
          <Modal
            show={isWalletModalOpen}
            onHide={() => setIsWalletModalOpen(false)}
            centered
            style={{
              zIndex: 2000,
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "#333",
              color: "white",
              borderRadius: "15px",
              width: "80%",
              maxWidth: "600px",
              height: "60%",
              overflow: "auto",
            }}
          >
            <Modal.Header>
              <Modal.Title style={{ textAlign: "center" }}>
                Select a Supported Wallet
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div
                className="wallet-option"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                  justifyContent: "center",
                  paddingLeft: "20px",
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (window.ethereum?.isMetaMask) {
                    connect({ connector: injected({ target: "metaMask" }) });
                    setIsWalletModalOpen(false);
                  } else {
                    setIsWalletModalOpen(false);
                    setShowModal(true);
                  }
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.opacity = "0.5";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  <img
                    src="/assets/images/MetaMask_Fox.png"
                    alt="MetaMask"
                    style={{
                      width: "50px",
                      height: "50px",
                      transition: "opacity 0.3s ease",
                    }}
                  />
                  <p>MetaMask</p>
                </div>
              </div>
              {/* Add more wallet options here */}
            </Modal.Body>
          </Modal>
        </section>
      </div>
    </>
  );
};

export default Deposit;
