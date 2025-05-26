"use client";
import { useAuthenticationModal, type StepsType } from "./context";
import {
  ImageCropper,
  UsernameInput,
  CompleteProfile,
  Guidelines,
  KsToCbWeb,
  KsToCbSubdomain,
  EditUsername,
  Logout,
  CategoryInput,
  ClaimBrandProfile,
  Starter,
  OtpInput,
  BirthInput,
  EditEmail,
  EditNumber,
  Note,
  DeleteConfirmation,
  DeleteConfirmed,
} from "./screens";

// import { setAuthTokenInAxiosInstance } from "@/lib/api/instance";
// import { getAppLink } from "@/lib/get-deeplink";

function removeQueryParams() {
  const url = new URL(window.location.href);
  url.searchParams.delete("code");
  url.searchParams.delete("provider");
  window.history.replaceState({}, "", url.href);
}

export function AuthenticationModalBody() {
  const { step, setStep } = useAuthenticationModal();

  switch (step) {
    case "STARTER":
      return (
        <Starter
          onNext={() => {
            setStep("LOGIN_OTP_INPUT");
          }}
        />
      );
    case "LOGIN_OTP_INPUT":
      return (
        <OtpInput
          verificationType="login"
          onNext={(step) => {
            setStep(step ?? "GUIDELINES");
          }}
          onBack={() => {
            setStep("STARTER");
          }}
        />
      );
    case "VERIFY_PHONE_OTP":
      return (
        <OtpInput
          title="Verify your phone"
          verificationType="number"
          onNext={() => {
            setStep("EDIT_PHONE_NUMBER_SUCCESS");
          }}
          onBack={() => {
            setStep("EDIT_PHONE_NUMBER");
          }}
        />
      );
    case "VERIFY_MAIL_OTP":
      return (
        <OtpInput
          title="Verify your email"
          verificationType="email"
          onNext={() => {
            setStep("EDIT_EMAIL_SUCCESS");
          }}
          onBack={() => {
            setStep("EDIT_EMAIL");
          }}
        />
      );
    case "EDIT_BIRTHDATE":
      return (
        <BirthInput
          onNext={() => {
            // closeModal()
            console.log("close modal");
          }}
        />
      );
    case "EDIT_EMAIL":
      return (
        <EditEmail
          onNext={() => {
            setStep("VERIFY_MAIL_OTP");
          }}
        />
      );
    case "EDIT_EMAIL_SUCCESS":
      return <Note title="Your email has been changed" />;
    case "EDIT_PHONE_NUMBER":
      return (
        <EditNumber
          onNext={() => {
            setStep("VERIFY_PHONE_OTP");
          }}
        />
      );
    case "EDIT_PHONE_NUMBER_SUCCESS":
      return <Note title="Your phone has been changed" />;
    case "IMAGE_CROPPER":
      return <ImageCropper />;
    case "CATEGORY_SELECTION":
      return (
        <CategoryInput
          onNext={(step) => {
            if (step) {
              setStep(step);
            } else {
              // closeModal();
            }
          }}
        />
      );
    case "USERNAME_INPUT":
      return (
        <UsernameInput
          onNext={() => {
            setStep("COMPLETE_PROFILE");
          }}
        />
      );
    case "COMPLETE_PROFILE":
      return <CompleteProfile />;
    case "GUIDELINES":
      return (
        <Guidelines
          onNext={(step) => {
            if (step) {
              setStep(step);
            } else {
              // closeModal();
            }
          }}
        />
      );
    case "EDIT_USERNAME":
      return <EditUsername />;
    case "LOGOUT":
      return <Logout />;
    case "CLAIM_BRAND_PROFILE":
      return <ClaimBrandProfile />;
    case "KS_CB_WEB":
      return <KsToCbWeb />;
    case "KS_CB_SUBDOMAIN":
      return <KsToCbSubdomain />;
    case "DELETE_CONFIRMATION":
      return (
        <DeleteConfirmation
          onNext={() => {
            setStep("DELETE_CONFIRMED");
          }}
        />
      );
    // case "DELETE_CONFIRMED":
    //   return <DeleteConfirmed />;
    // case "WALLET_HOW_IT_WORKS":
    //   return <HowItWorks />;
    // case "WITHDRAW_CASH":
    //   return <WithdrawDialog />;
    // case "REDEEM_CREDITS":
    //   return <RedeemCredits />;
  }
}
