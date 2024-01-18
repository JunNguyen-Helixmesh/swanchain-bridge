import { useRouter } from 'next/router'
import Link from 'next/link'

const TabMenu: React.FC = () => {
    const router = useRouter()
    return (
        <>
            <ul>
                <li className={router.pathname === "/" || router.pathname === "/deposit" ? "active" : ""}>
                    <Link href="/deposit">
                        Deposit
                    </Link>
                </li>
                <li className={router.pathname === "/withdraw" ? "active" : ""}>
                    <Link href="/withdraw">
                        Withdraw
                    </Link>
                </li>
            </ul>
        </>
    )
}

export default TabMenu