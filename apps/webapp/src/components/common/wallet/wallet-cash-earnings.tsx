"use client";
import { BackIcon } from "@icons/back-icon";
import { BillStreamlineIcon } from "@icons/wallet/bill-streamline";

import { useWalletStore } from "./store";

export const WalletCashEarningsCard = () => {
  const { setCurrentCardView, currentCardView, walletDetails } = useWalletStore();
  const cashAmount = walletDetails?.cash_balance;

  return (
    <div
      className={`bg-monochrome-white rounded-2xl border border-[#F4F4F4] p-4 text-left sm:p-6 ${
        currentCardView === "Cash" && "sm:border-[#77CE1A] sm:bg-[#77ce1a1a]"
      }`}
      onClick={() => {
        setCurrentCardView("Cash");
      }}>
      <div className="mb-2 flex justify-between">
        <BillStreamlineIcon className="h-8 stroke-[#77CE1A]" />
        <div className="text-title-2-bold text-secondary sm:text-title-1-bold flex items-center gap-2">
          ${(cashAmount / 100).toFixed(2)}
          <BackIcon className="fill-secondary-300 h-3.5 rotate-180" />
        </div>
      </div>

      <p className="text-title-3-demi text-secondary sm:text-title-2-demi">Cash Earnings</p>
      <p className="text-cap-1-med text-monochrome-black sm:text-cap-1-med sm:text-tertiary">
        Real cash by completing challenges
      </p>
    </div>
  );
};
