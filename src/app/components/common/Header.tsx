import React, { useEffect, useState, FunctionComponent } from 'react';
import "../../assets/style/common/header.scss";
import { Navbar, Container, Nav, Dropdown, OverlayTrigger, Tooltip, TooltipProps } from "react-bootstrap";
import Image from 'next/image'; // Next.js Image component
import Link from 'next/link'; // Next.js Link
import logo from "../../assets/images/logo.png";
import { useAccount, useConnect, useDisconnect, useNetwork } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { FaEthereum } from "react-icons/fa";
import { BiInfoCircle, BiPowerOff } from "react-icons/bi";
import { MdContentCopy } from "react-icons/md";
import { AiOutlineDownload, AiOutlineUpload } from "react-icons/ai";
import metamask from "../../assets/images/metamask.svg";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { CreateConnectorFn, Connector, Address } from 'wagmi/packages/core/src/connectors/createconnector';
import { ConnectErrorType } from 'wagmi/packages/core/src/actions/connect';

const HeaderNew: FunctionComponent = () => {
    const [copyTextSourceCode, setCopyTextSourceCode] = useState<string>("Copy address to clipboard");
    const { address, isConnected } = useAccount();
    const [getNetwork, setNetwork] = useState<string | undefined>();
    const [checkMetaMask, setCheckMetaMask] = useState<boolean>(false);
    const { chain, chains } = useNetwork();
    const { connect } = useConnect({
        connector: new InjectedConnector({ chains }),
        onMutate(args: { connector? : CreateConnectorFn | Connector}) {
            console.log('Mutate', args)
            if (args.connector.ready === true) {
                setCheckMetaMask(false)
            } else {
                setCheckMetaMask(true)
            }
        },
        onSettled(data: { accounts: readonly [Address, ...Address[]]; chainId: number }, error: ConnectErrorType) {
            console.log('Settled', { data, error })
        },
        onSuccess(data: { accounts: readonly [Address, ...Address[]]; chainId: number }) {
            console.log('Success', data)
        },
    })
    const { disconnect } = useDisconnect();
    const handleDisconnect = async () => {
        await disconnect()
    }
    useEffect(() => {
        if (chain?.id == 90001 || chain?.id == 11155111) {
            setNetwork(chain.name)
            console.log(chain.name);
        }
        else {
            setNetwork("Unsupported Network")
        }
    }, [chain]);
    const handleSourceCopy = () => {
        if (copyTextSourceCode === "Copy address to clipboard") {
            setCopyTextSourceCode("Copied.")
        }
    }
    const renderTooltip = (props: TooltipProps) => (
        <Tooltip id="button-tooltip" {...props}>
            {copyTextSourceCode}
        </Tooltip>
    );
    return (
        <>
            <header className='app_header'>
                <Navbar expand="lg" variant="dark">
                    <Container fluid>
                        <Link href="/" className='app_logo'>
                            <Image src={logo} alt="logo"/>
                        </Link>
                        <Navbar.Toggle aria-controls="navbarScroll" />
                        <Navbar.Collapse id="navbarScroll">
                            <Nav
                                className="me-auto my-2 my-lg-0"
                                style={{ maxHeight: '100px' }}
                                navbarScroll
                            >

                            </Nav>
                            <div className='right_header_wrap'>

                                <div className='header_btn_wrap'>
                                    {
                                        isConnected ? <button className='btn disconnect_btn header_btn me-2'>{getNetwork}</button> : ""
                                    }

                                    {/* {
                                    getNetwork !== "Unsupported Network" ? <button className='btn disconnect_btn header_btn me-2'><FaEthereum /> {getNetwork}</button> : <button className='btn disconnect_btn header_btn me-2'><BiInfoCircle /> {getNetwork} </button>
                                } */}
                                </div>
                                {/* <div className='header_btn_wrap'>

{address ? <button className='btn disconnect_btn header_btn' onClick={() => handleDisconnect()}>
                                    <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAsElEQVRYR2PslBX+z4AHHLiVgiLroDYHn3IGUtUzjjpg0IUAehyiRzipaYCQfow0MOoAuoeA5/dylHIAPY7RHWSt9Q5vOXD0mhDecgPdPMZRBwx4CJBaEOFNAFgkCZUbJNcFow4YDYHREBjwEKC0LkD3AMnlwKgDqB4CLYqpKO0BQvX5b5YgvOmQ9c86FHlC7QnGUQcMeAigN0jQIxg90aGnEUrVY7QJKTWQVAePOgAAXAoAZIiZ6M4AAAAASUVORK5CYII=" alt="Profile Icon" />
                                    {address.slice(0, 5)}...{address.slice(-5)}</button> : <button onClick={() => connect()} className='btn disconnect_btn header_btn'>Connect Wallet</button>}
                            </div> */}

                                <div className='dropdown_wrap'>
                                    {checkMetaMask === true ? <a className='btn disconnect_btn header_btn' href='https://metamask.io/' target='_blank'><Image src={metamask} alt="metamask icn"/> Please Install Metamask Wallet</a> : address ? <Dropdown>
                                        <Dropdown.Toggle variant="success" id="race_header_dropdown" >
                                            {address.slice(0, 5)}...{address.slice(-5)}
                                        </Dropdown.Toggle>
                                        <Dropdown.Menu>
                                            <div className='user_profile_wrap'>
                                                <figure className='user_profile'>
                                                    <Image src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAsElEQVRYR2PslBX+z4AHHLiVgiLroDYHn3IGUtUzjjpg0IUAehyiRzipaYCQfow0MOoAuoeA5/dylHIAPY7RHWSt9Q5vOXD0mhDecgPdPMZRBwx4CJBaEOFNAFgkCZUbJNcFow4YDYHREBjwEKC0LkD3AMnlwKgDqB4CLYqpKO0BQvX5b5YgvOmQ9c86FHlC7QnGUQcMeAigN0jQIxg90aGnEUrVY7QJKTWQVAePOgAAXAoAZIiZ6M4AAAAASUVORK5CYII=' alt="Profile Icon" />
                                                </figure>
                                                <h4>{address.slice(0, 5)}...{address.slice(-5)}
                                                    <OverlayTrigger
                                                        placement="top"
                                                        delay={{ show: 250, hide: 250 }}
                                                        overlay={renderTooltip}>
                                                        <CopyToClipboard text={address}>
                                                            <span className="d-inline-block"><MdContentCopy onClick={handleSourceCopy} /> </span>
                                                        </CopyToClipboard>
                                                    </OverlayTrigger>
                                                </h4>
                                            </div>
                                            <Dropdown.Item as={Link} to="/account/deposit"><AiOutlineDownload /> View Deposit</Dropdown.Item>
                                            <Dropdown.Item as={Link} to="/account/withdraw"><AiOutlineUpload /> View Withdrawals</Dropdown.Item>
                                            <Dropdown.Item onClick={() => handleDisconnect()}><BiPowerOff /> Disconnect</Dropdown.Item>
                                        </Dropdown.Menu>
                                    </Dropdown> : <button onClick={() => connect()} className='btn disconnect_btn header_btn'>Connect Wallet</button>}
                                </div>
                            </div>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
            </header>
        </>
    )
}
export default HeaderNew