import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTrigger,
} from "@genuin/ui/dialog";
import { XIcon } from "@genuin/ui/icons";

// import { useGenuinOptions } from "@lib/stores/genuin-options";
// import { useSearchParams } from "next/navigation";
// import { signIn } from "next-auth/react";
// import { useGenuinOptions } from "@lib/stores/genuin-options";
// import { useSearchParams } from "next/navigation";
// import { signIn } from "next-auth/react";
// import { setAuthTokenInAxiosInstance } from "src/react-query/axios-instance";

// import { DownloadDialogModal } from "../download-app";
// import { HowItWorks } from "../wallet/how-it-works";
// import { RedeemCredits } from "../wallet/redeem-credits";
// import { WithdrawDialog } from "../wallet/withdraw-cash";

// import { getUserDataForSSO } from "./authentication/api/auth";
import React, { useEffect } from "react";
import { useAuthContext } from "src/context/auth";

import { AuthenticationModalBody } from "./body";
import type { StepsType } from "./context";
import { useAuthenticationModal } from "./context";

type Props = React.ComponentProps<typeof Dialog> & { showClose?: boolean };

export function AuthenticationModal({ children, showClose, ...props }: Props) {
  // const searchParams = useSearchParams();
  const { user } = useAuthContext();
  // const { user } = useGenuinOptions(
  //   useShallow((state) => ({
  //     user: state.user,
  //     // webCTA: state.webCTA,
  //   }))
  // );
  const {
    action,
    // isModalOpen,
    // closeModal,
    step,
    setFormData,
    // open,
    // openWithStep,
  } = useAuthenticationModal();

  useEffect(() => {
    // const code = searchParams.get("code");
    // const provider = searchParams.get("provider");
    // if (!code || !provider) return;
    // void getUserDataForSSO(code, provider).then(async (res) => {
    //   setAuthTokenInAxiosInstance(res.user?.accessToken);
    //   // await signIn("credentials", { ...res.user, redirect: false }).then(
    //   //   (value) => {
    //   //     removeQueryParams();
    //   //     if (value?.ok) {
    //   //       if (!res.user?.brandGuidelines) {
    //   //         openWithStep(undefined, "GUIDELINES");
    //   //       } else if (!res.user.hasTopics) {
    //   //         openWithStep(undefined, "CATEGORY_SELECTION");
    //   //       } else if (!res.user.usernameSet) {
    //   //         openWithStep(undefined, "USERNAME_INPUT");
    //   //       }
    //   //     }
    //   //   }
    //   // );
    // });
  }, []);

  useEffect(() => {
    if (!user) return;
    // if (!user) {
    //   const showPopup = searchParams.get("show_login") === "1";
    //   if (!showPopup) return;

    //   if (webCTA === "app") {
    //     void getAppLink().then((generatedLink) => {
    //       DownloadDialogModal.open({
    //         title: <>Download the app</>,
    //         deepLink: generatedLink,
    //       });
    //     });
    //   } else {
    //     open();
    //   }
    //   return;
    // }
    setFormData({
      ...user,
      username: user.nickname,
      displayName: user.name ?? "",
      email: user?.email ?? "",
      image: user?.image ?? "",
      phoneNumber: user?.phoneNumber ?? "",
      birth: user.birth ?? undefined,
    });
  }, [user]);

  const stepSet: Set<StepsType> = new Set<StepsType>([
    "LOGIN_OTP_INPUT",
    "VERIFY_MAIL_OTP",
    "VERIFY_PHONE_OTP",
    "GUIDELINES",
    // 'CATEGORY_SELECTION', // Made it optional for Surprise Me
    "DELETE_CONFIRMATION",
    "DELETE_CONFIRMED",
    "IMAGE_CROPPER",
  ]);

  const shouldShowClose =
    !stepSet.has(step) && !(action === "DELETE_ACCOUNT" && step === "STARTER");

  return (
    <Dialog
      modal={action !== "DELETE_ACCOUNT"}
      // open={isModalOpen}
      {...props}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent
        // showClose={false}
        onInteractOutside={(e) => {
          e.preventDefault();
        }}
        className="gencl:rounded-t-lg gendl:py-10!"
      >
        {shouldShowClose && (
          <DialogClose className="gencl:absolute gencl:right-4 gencl:top-4 gencl:outline-none">
            <XIcon
              onClick={() => {
                setFormData({ flowType: "email", phoneNumber: "", email: "" });
                // closeModal();
              }}
            />
          </DialogClose>
        )}
        <AuthenticationModalBody />
      </DialogContent>
    </Dialog>
  );
}
