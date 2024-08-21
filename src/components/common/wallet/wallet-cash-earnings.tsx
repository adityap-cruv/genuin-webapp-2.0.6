'use client'
import BillStreamline from '@icons/icBillStreamline.svg'
import icBack from '@icons/icBack.svg'
import Image from 'next/image'
import { useWalletStore } from './store'

export const WalletCashEarningsCard = () => {
  const { setCurrentCardView, currentCardView } = useWalletStore()

  return (
    <div
      className={`rounded-2xl border border-[#F4F4F4] bg-monochrome-white p-4 text-left sm:p-6 ${
        currentCardView === 'Cash' && 'sm:border-[#77CE1A] sm:bg-[#77ce1a1a]'
      }`}
      onClick={() => {
        setCurrentCardView('Cash')
      }}>
      <div className="mb-2 flex justify-between">
        <Image src={BillStreamline} alt="DiscountCoupon" />
        <div className="flex items-center gap-2 text-title-2-bold text-secondary sm:text-title-1-bold">
          $50
          <Image src={icBack} alt="RightArrow" className="h-5 rotate-180" />
        </div>
      </div>

      <p className="text-title-3-demi text-secondary sm:text-title-2-demi">Cash Earnings</p>
      <p className="text-cap-1-med text-monochrome-black sm:text-cap-1-med sm:text-tertiary">
        Real cash by completing challenges
      </p>
    </div>
  )
}
