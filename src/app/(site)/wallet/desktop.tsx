'use client'
import { useWalletStore } from '@/components/common/wallet/store'
import { WalletBalanceCard } from '@/components/common/wallet/wallet-balance'
import { WalletCashEarningsCard } from '@/components/common/wallet/wallet-cash-earnings'
import { WalletCashTransactionsCard } from '@/components/common/wallet/wallet-cash-transactions'
import { WalletEarnMoreCard } from '@/components/common/wallet/wallet-earn-more'
import { WalletProgressBarCard } from '@/components/common/wallet/wallet-progress-bar'
import { WalletRewardCreditsCard } from '@/components/common/wallet/wallet-reward-credits'
import { WalletRewardTransactionsCard } from '@/components/common/wallet/wallet-reward-transactions'

export default function Desktop() {
  const { currentCardView } = useWalletStore()
  return (
    <div className="hide-scrollbar flex h-full w-full flex-col gap-6 overflow-auto">
      {/* Top section with WalletBalanceCard and WalletProgressBarCard */}
      <div className="mt-6 flex h-48 min-h-fit w-full rounded-2xl bg-primary p-6">
        <div className="h-full w-1/2">
          <WalletBalanceCard />
        </div>
        <div className="h-full w-1/2">
          <WalletProgressBarCard />
        </div>
      </div>

      {/* Sticky section with scrollable WalletTransactionsCard */}
      <div className="sticky top-0 flex w-full gap-6">
        <div className="flex w-2/5 flex-col gap-4">
          <WalletRewardCreditsCard />
          <WalletCashEarningsCard />
          <WalletEarnMoreCard />
        </div>
        <div className="max-h-[calc(100vh-6rem)] w-3/5 overflow-y-auto">
          {currentCardView === 'Reward' ? <WalletRewardTransactionsCard /> : <WalletCashTransactionsCard />}
        </div>
      </div>
    </div>
  )
}
