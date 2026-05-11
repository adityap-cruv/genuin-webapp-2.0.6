import { useState } from "react";
import { useShallow } from "zustand/react/shallow";

import { CustomImage } from "@/components/custom/custom-image";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import { redeemCouponAPI } from "@/lib/api/wallet";
import WarningIcon from "@icons/wallet/icAlertsWarningTriangle.svg";

import { ModalShell } from "../authentication/modal-shell";
import { useAuthenticationModalStore } from "../authentication/store";

export function RedeemCredits() {
  const { closeModal } = useAuthenticationModalStore(useShallow((state) => ({ closeModal: state.close })));
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleRedeem() {
    setIsLoading(true);
    const res = await redeemCouponAPI();
    if (res.data.code === 200) {
      closeModal();
      window.open(res.data.data.redeem_link, "_blank");
    } else {
      setErrorMessage(res.data.message);
    }
    setIsLoading(false);
  }
  return (
    <ModalShell>
      <CustomImage src={WarningIcon} height={100} width={100} alt="WarningIcon" />
      <p className="text-heading-3 text-secondary text-center">Redeem all credits?</p>
      <p className="text-title-3-med text-secondary text-center">
        This action will transfer all your reward credits to 'Tillo' for redeeming coupons. It cannot be undone.
      </p>
      <div className="flex w-full gap-2">
        <Button
          variant={"custom"}
          className="border-primary text-primary w-full border border-1"
          onClick={() => {
            closeModal();
          }}>
          Cancel
        </Button>

        <Button
          className="flex w-full items-center justify-center border-0"
          onClick={() => {
            void handleRedeem();
          }}>
          {isLoading ? <Loader size="sm" /> : "Confirm"}
        </Button>
      </div>
      {errorMessage !== "" && (
        <div>
          <p className="text-supplementary-red">{errorMessage}</p>
        </div>
      )}
    </ModalShell>
  );
}
