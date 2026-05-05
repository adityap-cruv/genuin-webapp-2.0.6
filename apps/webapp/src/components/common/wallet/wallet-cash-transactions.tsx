"use client";
import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { useTransactionsList } from "@/lib/api/wallet";

import { AuthenticationModal } from "../modals/authentication";

import { useWalletStore } from "./store";

export const WalletCashTransactionsCard = () => {
  const { data, isLoading, fetchNextPage, isFetchingNextPage, hasNextPage, refetch } = useTransactionsList({
    pageSize: 10,
    type: "CASH",
  });
  const transactions = data?.pages.flatMap((item) => item.transactions);
  const { currentCardView, walletDetails } = useWalletStore();
  const scrollDivRef = useRef<HTMLDivElement>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  async function getDetails() {
    await refetch();
  }

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    });

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="flex h-60 w-full items-center justify-center">
        <Loader size="md" />
      </div>
    );
  }

  return (
    <div className="bg-monochrome-white text-monochrome-black flex flex-col gap-4 rounded-2xl p-4 sm:p-6">
      <div
        className="flex h-24 items-center justify-between rounded-2xl p-6 sm:h-28"
        style={{
          backgroundColor: currentCardView === "Cash" ? "rgba(119, 206, 26, 0.10)" : "rgba(80, 124, 255, 0.10)",
        }}>
        <div>
          <p className="text-title-2-bold-home-m text-secondary mb-1">
            ${(walletDetails?.cash_balance / 100).toFixed(2)}
          </p>
          <p className="text-body-1-demi text-monochrome-black">Current balance</p>
        </div>
        <Button
          size="custom"
          className="border-primary rounded border"
          variant="outline"
          onClick={() => {
            AuthenticationModal.open(undefined, "WITHDRAW_CASH", getDetails);
          }}
          disabled={walletDetails?.cash_balance === 0}>
          <p className="text-body-1-demi text-primary px-4 py-1.5">
            {currentCardView === "Cash" ? "Withdraw" : "Redeem"}
          </p>
        </Button>
      </div>

      {transactions && transactions.length > 0 ? (
        <div>
          <p className="text-body-1-bold p-2">Transactions</p>

          <div className="flex h-fit flex-col gap-2 overflow-y-auto" ref={scrollDivRef}>
            {transactions.map((transaction, index) => (
              <div key={index}>
                <TransactionItem
                  title={transaction.title}
                  subtitle={transaction.created_at}
                  amount={transaction.amount}
                  status={transaction.status}
                />
              </div>
            ))}
            <div ref={loadMoreRef}>
              {isFetchingNextPage && (
                <div className="flex h-20 items-center justify-center p-4">
                  <Loader size="sm" />
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-body-1-demi text-tertiary flex h-60 flex-col items-center justify-center gap-2">
          No transactions yet
        </div>
      )}
    </div>
  );
};

const TransactionItem = ({
  title,
  subtitle,
  amount,
  status,
}: {
  title: string;
  subtitle: number;
  amount: number;
  status: string;
}) => {
  const amountColor: Record<string, string> = {
    HOLD: "text-monochrome-black",
    REJECT: "text-tertiary",
    CONFIRM: "text-green",
  };

  function formatTimestampToDate(timestamp: number) {
    // Convert the timestamp to milliseconds
    const date = new Date(timestamp * 1000);

    // Extract the day and month
    const day = date.getDate();
    const month = date.toLocaleString("default", { month: "long" });

    // Function to add the ordinal suffix
    const getOrdinalSuffix = (day: any) => {
      if (day > 3 && day < 21) return `${day}th`; // Covers 11th, 12th, 13th
      switch (day % 10) {
        case 1:
          return `${day}st`;
        case 2:
          return `${day}nd`;
        case 3:
          return `${day}rd`;
        default:
          return `${day}th`;
      }
    };

    return `${getOrdinalSuffix(day)} ${month}`;
  }

  return (
    <div
      className="bg-monochrome-white flex items-center justify-between rounded-2xl p-4"
      style={{
        boxShadow: "0px 4px 60px 0px rgba(0, 0, 0, 0.05)",
      }}>
      <div>
        <p className="text-body-1-demi text-monochrome-black">{title}</p>
        <p className="text-cap-1-demi text-tertiary-400">{formatTimestampToDate(subtitle)}</p>
      </div>
      <p className={`text-title-2-demi ${amount < 0 && status === "CONFIRM" ? "text-red" : amountColor[status]}`}>
        {amount < 0 ? "-" : "+"}${Math.abs(amount) / 100}
      </p>
    </div>
  );
};
