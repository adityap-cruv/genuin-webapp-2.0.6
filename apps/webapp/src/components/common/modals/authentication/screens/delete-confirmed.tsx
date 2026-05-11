"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";

import { Button } from "@components/ui/button";
import icConfirmationTick from "@icons/icConfirmationTick.svg";
import { PATH_NAME } from "@lib/utils/constants/path";

import { AuthenticationModal } from "..";
import { ModalShell } from "../modal-shell";

export function DeleteConfirmed() {
  const router = useRouter();
  return (
    <ModalShell>
      <Image src={icConfirmationTick} height={75} width={75} alt="success deletion" />
      <p className="text-heading-3 text-center">Account deleted!</p>
      <Button
        variant="default"
        className="w-full"
        onClick={() => {
          router.replace(PATH_NAME.home());
          AuthenticationModal.close();
        }}>
        Back to home
      </Button>
    </ModalShell>
  );
}
