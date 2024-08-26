'use client'
import { WalletCashEarningsCard } from '@/components/common/wallet/wallet-cash-earnings'
import { WalletEarnMoreCard } from '@/components/common/wallet/wallet-earn-more'
import { WalletProgressBarCard } from '@/components/common/wallet/wallet-progress-bar'
import { WalletRewardCreditsCard } from '@/components/common/wallet/wallet-reward-credits'
import { BackIcon } from '@icons/back-icon'
import { QuestionMarkIcon } from '@icons/question-mark-icon'
import { Sheet, SheetClose, SheetContent, SheetTrigger } from '@components/ui/sheet'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@components/ui/tabs'
import { type ReactNode } from 'react'
import { useWalletStore } from '@/components/common/wallet/store'
import { DiscountCouponIcon } from '@icons/wallet/discount-coupon-icon'
import { BillStreamlineIcon } from '@icons/wallet/bill-streamline'
import { AuthenticationModal } from '@/components/common/modals/authentication'
import Link from 'next/link'
import { PATH_NAME } from '@/lib/utils/constants/path'
import { WalletRewardTransactionsCard } from '@/components/common/wallet/wallet-reward-transactions'
import { WalletCashTransactionsCard } from '@/components/common/wallet/wallet-cash-transactions'

export default function Mobile() {
  const { walletDetails } = useWalletStore()
  const currentBalance = walletDetails.cash_balance + walletDetails.point_balance
  const lifetimeEarnings = Math.max(
    walletDetails.lifetime_cash_balance + walletDetails.lifetime_point_balance - currentBalance,
    0
  )

  return (
    <div className="h-[100vh] w-full bg-monochrome-11">
      <div className="relative flex h-64 w-full items-center rounded-b-2xl bg-primary">
        <div className="absolute top-0 flex h-14 w-full items-center justify-center py-2 text-center text-title-2-bold text-monochrome-white">
          Wallet
        </div>
        <div className="absolute top-0 flex h-14 w-full items-center justify-between px-6 py-2">
          <Link href={{ pathname: PATH_NAME.home() }}>
            <BackIcon className="fill-monochrome-white" />
          </Link>
          <QuestionMarkIcon
            className="cursor-pointer stroke-monochrome-white"
            onClick={() => {
              AuthenticationModal.open(undefined, 'WALLET_HOW_IT_WORKS')
            }}
          />{' '}
        </div>
        <div className="flex w-full justify-center gap-10 px-6 text-center">
          <div className="flex items-center gap-2">
            <div className="flex flex-col text-monochrome-white">
              <span className="text-new-h2-mobile">${(currentBalance / 100).toFixed(2)}</span>
              <span className="text-body-1-demi">Current balance</span>
            </div>
          </div>

          {lifetimeEarnings !== 0 && (
            <div className="flex items-center gap-2">
              <div className="flex flex-col text-monochrome-white/60">
                <span className="text-title-1-demi">${lifetimeEarnings / 100}</span>
                <span className="text-body-1-demi">Lifetime earnings</span>
              </div>
            </div>
          )}
        </div>

        <div className="absolute -bottom-16 w-full px-6">
          <WalletProgressBarCard />
        </div>
      </div>

      <div className="mt-20 flex flex-col gap-4 px-4">
        <div className="grid grid-cols-2 gap-4">
          <Transactions>
            <WalletRewardCreditsCard />
          </Transactions>

          <Transactions>
            <WalletCashEarningsCard />
          </Transactions>
        </div>
        <WalletEarnMoreCard />
      </div>
    </div>
  )
}

const Transactions = ({ children }: { children: ReactNode }) => {
  const { currentCardView, setCurrentCardView } = useWalletStore()

  return (
    <div>
      <Sheet>
        <SheetTrigger>{children}</SheetTrigger>
        <SheetContent
          showDefaultClose={false}
          side="right"
          className="h-full w-full overflow-auto border-none p-0 shadow-none outline-none">
          <div className="relative">
            <div className="absolute top-0 z-10 flex h-14 w-full items-center justify-between px-6 py-2">
              <SheetClose className="shadow-none outline-none">
                <BackIcon className="fill-monochrome-black" />
              </SheetClose>
              <QuestionMarkIcon
                className="cursor-pointer stroke-monochrome-black"
                onClick={() => {
                  AuthenticationModal.open(undefined, 'WALLET_HOW_IT_WORKS')
                }}
              />
            </div>
          </div>
          <div className="flex h-14 w-full items-center justify-center py-2 text-center text-title-2-bold text-monochrome-black">
            Wallet
          </div>

          <Tabs defaultValue={currentCardView}>
            <TabsList className="flex">
              <TabsTrigger
                value="Reward"
                onClick={() => {
                  setCurrentCardView('Reward')
                }}>
                <DiscountCouponIcon className="mr-1 h-6" />
                <p className="text-title-3-demi text-monochrome-black">Reward credits</p>
              </TabsTrigger>
              <TabsTrigger
                value="Cash"
                onClick={() => {
                  setCurrentCardView('Cash')
                }}>
                <BillStreamlineIcon className="mr-2 h-6" />
                <p className="text-title-3-demi text-monochrome-black">Cash earnings</p>
              </TabsTrigger>
            </TabsList>
            <hr className="border-t border-tertiary-200" />
            <TabsContent value="Reward">
              <WalletRewardTransactionsCard />
            </TabsContent>
            <TabsContent value="Cash">
              <WalletCashTransactionsCard />
            </TabsContent>
          </Tabs>
        </SheetContent>
      </Sheet>
    </div>
  )
}
