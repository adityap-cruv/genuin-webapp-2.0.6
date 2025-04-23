'use client'
import { useWalletStore } from './store'
import { DiscountCouponIcon } from '@icons/wallet/discount-coupon-icon'
import { BackIcon } from '@icons/back-icon'

export const WalletRewardCreditsCard = () => {
  const { setCurrentCardView, currentCardView, walletDetails } = useWalletStore()
  const rewardAmount = walletDetails?.point_balance
  return (
    <div
      className={`rounded-2xl border border-[#F5F5F5] bg-monochrome-white p-4 text-left sm:p-6 ${
        currentCardView === 'Reward' && 'sm:border-[#507CFF] sm:bg-[#E6ECFF]'
      }`}
      onClick={() => {
        setCurrentCardView('Reward')
      }}>
      <div className="mb-2 flex justify-between">
        {/* <Image src={DiscountCoupon} alt="DiscountCoupon" /> */}
        <DiscountCouponIcon className="h-8 stroke-[#507CFF]" />
        <div className="flex items-center gap-2 text-title-2-bold text-secondary sm:text-title-1-bold">
          ${(rewardAmount / 100).toFixed(2)}
          <BackIcon className="h-3.5 rotate-180 fill-secondary-300" />
        </div>
      </div>

      <p className="text-title-3-demi text-secondary sm:text-title-2-demi">Reward credits</p>
      <p className="text-cap-1-med text-monochrome-black sm:text-cap-1-med sm:text-tertiary">
        From engaging with content in communities
      </p>
    </div>
  )
}
