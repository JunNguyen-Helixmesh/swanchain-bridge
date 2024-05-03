import WithdrawHistory from '../../components/WithdrawHistory'
import { GetServerSideProps } from 'next'

export const getServerSideProps: GetServerSideProps = async (context) => {
  return {
    props: {},
  }
}

export default function WithdrawHistoryPage() {
  return <WithdrawHistory />
}
