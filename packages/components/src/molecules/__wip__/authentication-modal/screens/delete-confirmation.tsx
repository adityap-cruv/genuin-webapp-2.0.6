"use client";
import { Button } from "@components/ui/button";
import { useState } from "react";
import { PATH_NAME } from "@lib/utils/constants/path";
import { useRouter } from "next/navigation";
import { Loader } from "@components/ui/loader";
import { deleteUserAccount } from "../api/auth";
import { ModalShell } from "../modal-shell";
import { type ScreenProps } from ".";
import { AuthenticationModal } from "../authentication";
import { signOut } from "next-auth/react";

export function DeleteConfirmation({ onNext }: ScreenProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function onDelete() {
    setIsLoading(true);
    await deleteUserAccount()
      .then(async (res) => {
        if (res?.code === 200) {
          await signOut();
          onNext();
        } else if (res?.code === 5250) {
          setError("The Account deletion is not permitted for this user");
        } else {
          setError("Something went wrong please try again after sometime!");
        }
      })
      .finally(() => {
        setIsLoading(false);
      });
  }
  return (
    <ModalShell>
      <p className="text-center text-heading-3">Delete account?</p>
      <p className="text-center text-title-3-med text-tertiary">
        Are you sure you want to delete your Genuin account? Your this action
        can't be reversed.
      </p>
      <div className="flex w-full gap-4">
        <Button
          type="submit"
          variant="outline"
          className="w-full"
          onClick={() => {
            router.replace(PATH_NAME.home());
            AuthenticationModal.close();
          }}
        >
          Cancel
        </Button>
        <Button
          variant="default"
          className="w-full bg-primary hover:bg-primary-700"
          onClick={onDelete}
        >
          {isLoading ? (
            <Loader
              size="sm"
              className="fill-monochrome-white stroke-monochrome-white"
            />
          ) : (
            <p className="text-title-3-demi">Delete</p>
          )}
        </Button>
      </div>
      {error && (
        <p className="text-text-new-para-2-mobile flex items-center justify-center text-center text-supplementary-red">
          {error}
        </p>
      )}
    </ModalShell>
  );
}
