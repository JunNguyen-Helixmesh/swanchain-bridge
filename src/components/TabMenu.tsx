import { useRouter } from 'next/router'
import Link from 'next/link'
import NextImage from 'next/image'

const TabMenu: React.FC = () => {
    const router = useRouter()
    return (
        <>
            <div className="tab-header flex-row">
                <NextImage
                    src="/assets/images/logo.png"
                    alt="SWAN logo"
                    layout="responsive"
                    width={86}
                    height={30}
                    className="logo-svg"
                />
                <div className="flex-row items-center">
                    <div className={router.pathname === "/" || router.pathname === "/deposit" ? "active rounded-btn" : "rounded-btn"}>
                        <Link href="/deposit">
                            Deposit
                    </Link>
                    </div>
                    <div className={router.pathname === "/withdraw" ? "active rounded-btn" : "rounded-btn"}>
                        <Link href="/withdraw">
                            Withdraw
                    </Link>
                    </div>
                </div>
            </div>
        </>
    )
}

export default TabMenu