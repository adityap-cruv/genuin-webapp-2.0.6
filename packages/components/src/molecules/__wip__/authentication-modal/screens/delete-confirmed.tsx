"use client";
import { Button } from "@components/ui/button";
import { PATH_NAME } from "@lib/utils/constants/path";
import { useRouter } from "next/navigation";
import icConfirmationTick from "@icons/icConfirmationTick.svg";
import { AuthenticationModal } from "../authentication";
import { ModalShell } from "../modal-shell";
import Image from "next/image";

export function DeleteConfirmed() {
  const router = useRouter();
  return (
    <ModalShell>
      <Image
        src={icConfirmationTick}
        height={75}
        width={75}
        alt="success deletion"
      />
      <p className="text-center text-heading-3">Account deleted!</p>
      <Button
        variant="default"
        className=" w-full"
        onClick={() => {
          router.replace(PATH_NAME.home());
          AuthenticationModal.close();
        }}
      >
        Back to home
      </Button>
    </ModalShell>
  );
}
