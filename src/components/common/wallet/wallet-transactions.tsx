'use client'
import { Button } from '@/components/ui/button'
import { useWalletStore } from './store'
import { AuthenticationModal } from '../modals/authentication'

export const WalletTransactionsCard = () => {
  const { currentCardView } = useWalletStore()

  return (
    <div className="flex flex-col gap-4 rounded-2xl bg-monochrome-white p-4 text-monochrome-black sm:p-6">
      <div
        className="flex h-24 items-center justify-between rounded-2xl p-6 sm:h-28"
        style={{
          backgroundColor: currentCardView === 'Cash' ? 'rgba(119, 206, 26, 0.10)' : 'rgba(80, 124, 255, 0.10)',
        }}>
        <div>
          <p className="mb-1 text-title-2-bold-home-m text-secondary">$50</p>
          <p className="text-body-1-demi text-monochrome-black">Current balance</p>
        </div>
        <Button
          size="custom"
          className="rounded border border-primary"
          variant="outline"
          onClick={() => {
            AuthenticationModal.open(undefined, 'WITHDRAW_CASH')
          }}>
          <p className="px-4 py-1.5 text-body-1-demi text-primary">
            {currentCardView === 'Cash' ? 'Withdraw' : 'Redeem'}
          </p>
        </Button>
      </div>

      <p className="p-2 text-body-1-bold">Transactions</p>

      <div className="flex flex-col gap-2">
        <TransactionItem
          title="Transaction in process"
          subtitle="8th May"
          amount="-$28"
          amountColor="text-tertiary-400"
        />
        <TransactionItem
          title="Challenge Name here"
          subtitle="TED · 8th May"
          amount="+$28"
          amountColor="text-supplementary-green"
        />
        <TransactionItem
          title="Transaction in process"
          subtitle="8th May"
          amount="-$28"
          amountColor="text-tertiary-400"
        />
        <TransactionItem
          title="Transaction in process"
          subtitle="8th May"
          amount="-$28"
          amountColor="text-tertiary-400"
        />
        <TransactionItem
          title="Challenge Name here"
          subtitle="TED · 8th May"
          amount="+$28"
          amountColor="text-supplementary-green"
        />
      </div>
    </div>
  )
}

const TransactionItem = ({
  title,
  subtitle,
  amount,
  amountColor,
}: {
  title: string
  subtitle: string
  amount: string
  amountColor: string
}) => (
  <div
    className="flex items-center justify-between rounded-2xl bg-monochrome-white p-4"
    style={{
      boxShadow: '0px 4px 60px 0px rgba(0, 0, 0, 0.05)',
    }}>
    <div>
      <p className="text-body-1-demi text-monochrome-black">{title}</p>
      <p className="text-cap-1-demi text-tertiary-400">{subtitle}</p>
    </div>
    <p className={`text-title-2-demi ${amountColor}`}>{amount}</p>
  </div>
)
