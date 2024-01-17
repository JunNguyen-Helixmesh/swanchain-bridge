import React, { useState, FunctionComponent } from 'react';
import { Tooltip, OverlayTrigger, TooltipProps } from 'react-bootstrap'; 
import { MdContentCopy } from "react-icons/md";
import { useAccount } from "wagmi";
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Link from 'next/link';
import { useRouter } from 'next/router';


const Account: FunctionComponent = () => {
    const [copyTextSourceCode, setCopyTextSourceCode] = useState<string>("Copy address to clipboard");
    const router = useRouter();
    const { address, isConnected } = useAccount();

    const handleSourceCopy = (): void => {
        setCopyTextSourceCode("Copied.");
    };

    const renderTooltip = (props: TooltipProps) => (
        <Tooltip id="button-tooltip" {...props}>
            {copyTextSourceCode}
        </Tooltip>
    );
    return (
        <>
            <div className='account_title'>
                <h3>Account</h3>
                {
                    isConnected &&
                    <h6>
                        <span>{address}</span> <OverlayTrigger
                            placement="top"
                            delay={{ show: 250, hide: 250 }}
                            overlay={renderTooltip}>

                            <CopyToClipboard text={address || ''}>
                                <span className="d-inline-block"> <MdContentCopy onClick={handleSourceCopy} /> </span>
                            </CopyToClipboard>

                        </OverlayTrigger>
                    </h6>
                }
            </div>
            <div className='account_tabs'>
                <ul>
                    <li><Link href="/account/deposit"><a className={`${router.pathname == "/account/deposit" ? "active" : ""}`}>Deposit</a></Link></li>
                    <li><Link href="/account/withdraw"><a className={`${router.pathname == "/account/withdraw" ? "active" : ""}`}>Withdraw</a></Link></li>
                </ul>
            </div>
        </>
    );
};

export default Account;