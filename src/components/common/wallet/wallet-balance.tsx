'use client'
import { QuestionMarkIcon } from '@icons/question-mark-icon'
import { AuthenticationModal } from '../modals/authentication'
import { useWalletStore } from './store'

export const WalletBalanceCard = () => {
  const { walletDetails } = useWalletStore()
  const currentBalance = walletDetails.cash_balance + walletDetails.point_balance
  const lifetimeEarnings = Math.max(walletDetails.lifetime_cash_balance + walletDetails.lifetime_point_balance, 0)

  return (
    <div className="flex h-full w-full flex-col justify-between py-4 text-monochrome-white">
      <div className="flex items-center gap-4">
        <p className="text-title-1-bold">Wallet</p>
        <QuestionMarkIcon
          className="cursor-pointer stroke-monochrome-white/60"
          onClick={() => {
            AuthenticationModal.open(undefined, 'WALLET_HOW_IT_WORKS')
          }}
        />
      </div>
      <div className="flex gap-10">
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <span className="text-new-h2-mobile">${(currentBalance / 100).toFixed(2)}</span>
            <span className="text-body-1-demi">Current balance</span>
          </div>
        </div>

        {lifetimeEarnings !== 0 && (
          <div className="flex items-center gap-2">
            <div className="flex flex-col text-monochrome-white/60">
              <span className="text-title-1-demi">${(lifetimeEarnings / 100).toFixed(2)}</span>
              <span className="text-body-1-demi">Lifetime earnings</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
