'use client'
import DiscountCoupon from '@icons/icDiscountCoupon.svg'
import icBack from '@icons/icBack.svg'
import Image from 'next/image'
import { useWalletStore } from './store'

export const WalletRewardCreditsCard = () => {
  const { setCurrentCardView, currentCardView } = useWalletStore()
  return (
    <div
      className={`rounded-2xl border border-[#F5F5F5] bg-monochrome-white p-4 text-left sm:p-6 ${
        currentCardView === 'Reward' && 'sm:border-[#507CFF] sm:bg-[#E6ECFF]'
      }`}
      onClick={() => {
        setCurrentCardView('Reward')
      }}>
      <div className="mb-2 flex justify-between">
        <Image src={DiscountCoupon} alt="DiscountCoupon" />
        <div className="flex items-center gap-2 text-title-2-bold text-secondary sm:text-title-1-bold">
          $50
          <Image src={icBack} alt="RightArrow" className="h-5 rotate-180" />
        </div>
      </div>

      <p className="text-title-3-demi text-secondary sm:text-title-2-demi">Reward credits</p>
      <p className="text-cap-1-med text-monochrome-black sm:text-cap-1-med sm:text-tertiary">
        From engaging with content in communities
      </p>
    </div>
  )
}
