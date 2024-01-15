import { useRouter } from 'next/router'
import Link from 'next/link'

const TabMenu: React.FC = () => {
    const router = useRouter()
    return (
        <>
            <ul>
                <li>
                    <Link href="/deposit">
                        <a className={router.pathname === "/" || router.pathname === "/deposit" ? "active" : ""}>Deposit</a>
                    </Link>
                </li>
                <li>
                    <Link href="/withdraw">
                        <a className={router.pathname === "/withdraw" ? "active" : ""}>Withdraw</a>
                    </Link>
                </li>
            </ul>
        </>
    )
}

export default TabMenu