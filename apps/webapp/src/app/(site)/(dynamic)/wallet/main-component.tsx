"use client";
import React, { useEffect } from "react";

import { useWalletStore } from "@/components/common/wallet/store";
import { WalletLayout } from "@/components/layouts/wallet/desktop/layout";
import { getBalanceAPI } from "@/lib/api/wallet";
import { useGenuinOptions } from "@/lib/stores/genuin-options";

import Desktop from "./desktop";
import { EmptyState } from "./empty-state";
import Mobile from "./mobile";

const MainWalletComponent = () => {
  const { setInitialData } = useGenuinOptions((state) => ({
    setInitialData: state.setData,
  }));
  const { setWalletDetails, walletDetails } = useWalletStore();

  async function handleBalance() {
    const { wallet } = await getBalanceAPI({ isCurrentBalance: false });
    setWalletDetails(wallet);
    setInitialData({ walletBalance: Number(wallet.point_balance + wallet.cash_balance) });
  }

  useEffect(() => {
    void handleBalance();
  }, []);

  return (
    <>
      <div className="hidden sm:block">
        <WalletLayout>{walletDetails.point_balance === 0 ? <EmptyState.desktop /> : <Desktop />}</WalletLayout>
      </div>
      <div className="sm:hidden">{walletDetails.point_balance === 0 ? <EmptyState.mobile /> : <Mobile />}</div>
    </>
  );
};

export default MainWalletComponent;
