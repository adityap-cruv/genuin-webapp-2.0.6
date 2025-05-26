import { ModalShell } from "../modal-shell";
import { Button } from "@genuin/ui/button";
// import { removeAllAuthToken } from "@lib/api/instance";
import { removeAllAuthToken } from "src/react-query/axios-instance";
import { useAuthenticationModal } from "../context";
import { checkIfUrlIncludesProtectedRoute } from "src/lib/utils";
import { useAuthContext } from "src/context/auth";
// import { signOut } from "next-auth/react";
// import { useAuthenticationModalStore } from "../authentication/store";
// import { checkIfUrlIncludesProtectedRoute } from "@/lib/utils";

export function Logout() {
  const { close } = useAuthenticationModal();
  const { signOut } = useAuthContext();

  return (
    <ModalShell>
      <h3 className="text-center text-title-1-demi sm:text-heading-3">
        Log out?
      </h3>
      <p className="text-center text-title-3-med">
        You won’t be able to contribute in any community or receive
        notifications.{" "}
      </p>
      <Button
        className="w-full text-title-3-med !text-monochrome-white"
        onClick={() => {
          let redirectUrl = window.location.pathname;
          if (checkIfUrlIncludesProtectedRoute(redirectUrl)) {
            redirectUrl = "/home";
          }
          redirectUrl += window.location.search;
          // void signOut({ callbackUrl: redirectUrl, redirect: true });
          // TODO: process the requests here.
          signOut();

          removeAllAuthToken();
        }}
      >
        Logout
      </Button>
      <p
        className="text-title-3-med hover:cursor-pointer"
        onClick={() => {
          close();
        }}
      >
        Cancel
      </p>
    </ModalShell>
  );
}
