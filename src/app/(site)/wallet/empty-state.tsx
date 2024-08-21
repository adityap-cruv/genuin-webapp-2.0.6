'use client'
import BillStreamline from '@icons/icBillStreamline.svg'
import DiscountCoupon from '@icons/icDiscountCoupon.svg'
import icBack from '@icons/icBack.svg'
import Image from 'next/image'
import { QuestionMarkIcon } from '@icons/question-mark-icon'
import { BackIcon } from '@icons/back-icon'
import { AuthenticationModal } from '@/components/common/modals/authentication'

export const EmptyState = {
  mobile: Mobile,
  desktop: Desktop,
}

function Desktop() {
  return (
    <div className="flex h-full w-full flex-col gap-6">
      <div className="mt-6 flex h-48 min-h-fit w-full flex-col items-center justify-between rounded-2xl bg-primary p-10 text-center text-monochrome-white">
        <div className="flex items-center gap-4">
          <p className="text-title-1-bold">Wallet</p>
          <QuestionMarkIcon
            className="cursor-pointer stroke-monochrome-white/60"
            onClick={() => {
              AuthenticationModal.open(undefined, 'WALLET_HOW_IT_WORKS')
            }}
          />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-new-h2-mobile">$0</span>
          <span className="text-body-1-demi">Current balance</span>
        </div>
      </div>

      <div className="sticky top-0 flex w-full gap-6">
        <div className="flex w-2/5 flex-col gap-4">
          <div className="rounded-2xl bg-monochrome-white p-6 opacity-50">
            <div className="mb-2 flex justify-between">
              <Image src={DiscountCoupon} alt="DiscountCoupon" />
              <div className="flex items-center gap-2 text-title-1-bold text-monochrome-black">
                $0
                <Image src={icBack} alt="RightArrow" className="h-5 rotate-180" />
              </div>
            </div>

            <p className="text-title-2-demi text-monochrome-black">Reward credits</p>
            <p className="text-cap-1-med text-tertiary">From engaging with content in communities</p>
          </div>

          <div className="rounded-2xl bg-monochrome-white p-6 opacity-50">
            <div className="mb-2 flex justify-between">
              <Image src={BillStreamline} alt="DiscountCoupon" />
              <div className="flex items-center gap-2 text-title-1-bold text-monochrome-black">
                $0
                <Image src={icBack} alt="RightArrow" className="h-5 rotate-180" />
              </div>
            </div>

            <p className="text-title-2-demi text-monochrome-black">Cash Earnings</p>
            <p className="text-cap-1-med text-tertiary">From engaging with content in communities</p>
          </div>
        </div>

        <div className="max-h-[calc(100vh-6rem)] w-3/5 overflow-y-auto">
          <div
            className="flex flex-col items-center gap-2 rounded-2xl bg-monochrome-white p-6 text-center"
            style={{
              boxShadow: '0px 4px 60px 0px rgba(0, 0, 0, 0.05)',
            }}>
            <div className="relative h-12 w-12">
              <div className="absolute left-4 z-10 h-12 w-12 rounded-full border-2 border-monochrome-white bg-red" />
              <div className="absolute right-4 h-12 w-12 rounded-full border-2 border-monochrome-white bg-blue" />
            </div>

            <p className="text-body-1-demi text-monochrome-black">Start earning cash and reward credits</p>
            <p className="text-cap-1-med text-tertiary">
              Earn real cash by completing challenges. Explore ongoing challenges by TED
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function Mobile() {
  return (
    <>
      <div className="h-[100vh] w-full bg-monochrome-11">
        <div className="relative flex h-64 w-full items-center rounded-b-2xl bg-primary">
          <div className="absolute top-0 flex h-14 w-full items-center justify-center py-2 text-center text-title-2-bold text-monochrome-white">
            Wallet
          </div>
          <div className="absolute top-0 flex h-14 w-full items-center justify-between px-6 py-2">
            <BackIcon className="fill-monochrome-white" />
            <QuestionMarkIcon
              className="cursor-pointer stroke-monochrome-white"
              onClick={() => {
                AuthenticationModal.open(undefined, 'WALLET_HOW_IT_WORKS')
              }}
            />
          </div>
          <div className="flex w-full justify-center gap-10 px-6 text-center">
            <div className="flex items-center gap-2">
              <div className="flex flex-col text-monochrome-white">
                <span className="text-new-h2-mobile">$0</span>
                <span className="text-body-1-demi">Current balance</span>
              </div>
            </div>
          </div>

          <div className="absolute -bottom-28 w-full px-6">
            <div
              className="flex flex-col items-center gap-2 rounded-2xl bg-monochrome-white p-6 text-center"
              style={{
                boxShadow: '0px 4px 60px 0px rgba(0, 0, 0, 0.05)',
              }}>
              <div className="relative h-12 w-12">
                <div className="absolute left-4 z-10 h-12 w-12 rounded-full border-2 border-monochrome-white bg-red" />
                <div className="absolute right-4 h-12 w-12 rounded-full border-2 border-monochrome-white bg-blue" />
              </div>

              <p className="text-body-1-demi text-monochrome-black">Start earning cash and reward credits</p>
              <p className="text-cap-1-med text-tertiary">
                Earn real cash by completing challenges. Explore ongoing challenges by TED
              </p>
            </div>
          </div>
        </div>

        <div className="mt-32 flex flex-col gap-4 px-4 opacity-40">
          <div className="grid grid-cols-2 gap-4">
            <div className={`rounded-2xl border border-[#F5F5F5] bg-monochrome-white p-4 text-left sm:p-6 `}>
              <div className="mb-2 flex justify-between">
                <Image src={DiscountCoupon} alt="DiscountCoupon" />
                <div className="flex items-center gap-2 text-title-2-bold text-monochrome-black sm:text-title-1-bold">
                  $0
                  <Image src={icBack} alt="RightArrow" className="h-5 rotate-180" />
                </div>
              </div>

              <p className="text-title-3-demi text-monochrome-black sm:text-title-2-demi">Reward credits</p>
              <p className="text-cap-1-med text-monochrome-black sm:text-cap-1-med sm:text-tertiary">
                From engaging with content in communities
              </p>
            </div>

            <div className={`rounded-2xl border border-[#F4F4F4] bg-monochrome-white p-4 text-left sm:p-6 `}>
              <div className="mb-2 flex justify-between">
                <Image src={BillStreamline} alt="DiscountCoupon" />
                <div className="flex items-center gap-2 text-title-2-bold text-monochrome-black sm:text-title-1-bold">
                  $0
                  <Image src={icBack} alt="RightArrow" className="h-5 rotate-180" />
                </div>
              </div>

              <p className="text-title-3-demi text-monochrome-black sm:text-title-2-demi">Cash Earnings</p>
              <p className="text-cap-1-med text-monochrome-black sm:text-cap-1-med sm:text-tertiary">
                Real cash by completing challenges
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
