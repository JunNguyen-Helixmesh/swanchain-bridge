import { useRouter } from 'next/router'
import Link from 'next/link'

const TabMenu: React.FC = () => {
    const router = useRouter()
    return (
        <>
            <ul>
                <li>
                    <Link href="/deposit">
                        <span className={router.pathname === "/" || router.pathname === "/deposit" ? "active" : ""}>Deposit</span>
                    </Link>
                </li>
                <li>
                    <Link href="/withdraw">
                        <span className={router.pathname === "/withdraw" ? "active" : ""}>Withdraw</span>
                    </Link>
                </li>
            </ul>
        </>
    )
}

export default TabMenu