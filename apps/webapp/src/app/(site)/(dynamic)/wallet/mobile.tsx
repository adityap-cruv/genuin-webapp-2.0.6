"use client";
import Link from "next/link";
import { type ReactNode } from "react";

import { AuthenticationModal } from "@/components/common/modals/authentication";
import { useWalletStore } from "@/components/common/wallet/store";
import { WalletCashEarningsCard } from "@/components/common/wallet/wallet-cash-earnings";
import { WalletCashTransactionsCard } from "@/components/common/wallet/wallet-cash-transactions";
import { WalletEarnMoreCard } from "@/components/common/wallet/wallet-earn-more";
import { WalletProgressBarCard } from "@/components/common/wallet/wallet-progress-bar";
import { WalletRewardCreditsCard } from "@/components/common/wallet/wallet-reward-credits";
import { WalletRewardTransactionsCard } from "@/components/common/wallet/wallet-reward-transactions";
import { PATH_NAME } from "@/lib/utils/constants/path";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@components/ui/sheet";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@components/ui/tabs";
import { BackIcon } from "@icons/back-icon";
import { QuestionMarkIcon } from "@icons/question-mark-icon";
import { BillStreamlineIcon } from "@icons/wallet/bill-streamline";
import { DiscountCouponIcon } from "@icons/wallet/discount-coupon-icon";

export default function Mobile() {
  const { walletDetails } = useWalletStore();
  const currentBalance = walletDetails.cash_balance + walletDetails.point_balance;
  const lifetimeEarnings = Math.max(walletDetails.lifetime_cash_balance + walletDetails.lifetime_point_balance, 0);

  return (
    <div className="bg-monochrome-11 h-[100vh] w-full">
      <div className="bg-primary relative flex h-64 w-full items-center rounded-b-2xl">
        <div className="text-title-2-bold text-monochrome-white absolute top-0 flex h-14 w-full items-center justify-center py-2 text-center">
          Wallet
        </div>
        <div className="absolute top-0 flex h-14 w-full items-center justify-between px-6 py-2">
          <Link href={{ pathname: PATH_NAME.home() }}>
            <BackIcon className="fill-monochrome-white" />
          </Link>
          <QuestionMarkIcon
            className="stroke-monochrome-white cursor-pointer"
            onClick={() => {
              AuthenticationModal.open(undefined, "WALLET_HOW_IT_WORKS");
            }}
          />{" "}
        </div>
        <div className="flex w-full justify-center gap-10 px-6 text-center">
          <div className="flex items-center gap-2">
            <div className="text-monochrome-white flex flex-col">
              <span className="text-new-h2-mobile">${(currentBalance / 100).toFixed(2)}</span>
              <span className="text-body-1-demi">Current balance</span>
            </div>
          </div>

          {lifetimeEarnings !== 0 && (
            <div className="flex items-center gap-2">
              <div className="text-monochrome-white/60 flex flex-col">
                <span className="text-title-1-demi">${(lifetimeEarnings / 100).toFixed(2)}</span>
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
  );
}

const Transactions = ({ children }: { children: ReactNode }) => {
  const { currentCardView, setCurrentCardView } = useWalletStore();

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
                className="stroke-monochrome-black cursor-pointer"
                onClick={() => {
                  AuthenticationModal.open(undefined, "WALLET_HOW_IT_WORKS");
                }}
              />
            </div>
          </div>
          <div className="text-title-2-bold text-monochrome-black flex h-14 w-full items-center justify-center py-2 text-center">
            Wallet
          </div>

          <Tabs defaultValue={currentCardView}>
            <TabsList className="flex">
              <TabsTrigger
                value="Reward"
                onClick={() => {
                  setCurrentCardView("Reward");
                }}>
                <DiscountCouponIcon className="mr-1 h-6" />
                <p className="text-title-3-demi text-monochrome-black">Reward credits</p>
              </TabsTrigger>
              <TabsTrigger
                value="Cash"
                onClick={() => {
                  setCurrentCardView("Cash");
                }}>
                <BillStreamlineIcon className="mr-2 h-6" />
                <p className="text-title-3-demi text-monochrome-black">Cash earnings</p>
              </TabsTrigger>
            </TabsList>
            <hr className="border-tertiary-200 border-t" />
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
  );
};
