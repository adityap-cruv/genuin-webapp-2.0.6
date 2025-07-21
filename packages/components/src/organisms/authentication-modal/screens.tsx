import { useEffect } from "react";
import { useAuthenticationModalContext } from "./context";
import { BecomeCreator } from "./screens/become-creator";
import { CategoryInput } from "./screens/category-input";
import { DeleteAccount } from "./screens/delete-account";
import { EditBio } from "./screens/edit-bio";
import { EditBirthDate } from "./screens/edit-birth-date";
import { EditEmail } from "./screens/edit-email";
import { EditFullName } from "./screens/edit-full-name";
import { EditPhoneNumber } from "./screens/edit-phone-number";
import { EditProfilePicture } from "./screens/edit-profile-picture";
import { EditSocialProfiles } from "./screens/edit-social-profiles";
import { EditUserName } from "./screens/edit-username";
import { GetApp } from "./screens/get-app";
import { Guidelines } from "./screens/guidelines";
import { OtpVerification } from "./screens/otp";
import { OtpVerificationDeleteAccount } from "./screens/otp/otp-verfication-delete-account";
import { RemovePicture } from "./screens/remove-picture";
import { SignOut } from "./screens/sign-out";
import { SignIn } from "./screens/signin";

export function Screens() {
  const { step, setStep } = useAuthenticationModalContext();

  switch (step) {
    case "SIGNIN":
      return <SignIn onNext={() => setStep("LOGIN_OTP_INPUT")} />;
    case "LOGIN_OTP_INPUT":
      return <OtpVerification verificationType="LOGIN" />;
    case "VERIFY_PHONE_OTP":
      return (
        <OtpVerification title="Verify your phone" verificationType="PHONE" />
      );
    case "VERIFY_MAIL_OTP":
      return (
        <OtpVerification title="Verify your email" verificationType="EMAIL" />
      );
    case "BRAND_GUIDELINES":
      return <Guidelines />;
    case "CATEGORY_SELECTION":
      return <CategoryInput />;
    case "EDIT_EMAIL":
      return <EditEmail />;
    case "EDIT_PHONE_NUMBER":
      return <EditPhoneNumber />;
    case "EDIT_USERNAME":
      return <EditUserName />;
    case "GET_APP":
      return <GetApp />;
    case "BECOME_CREATOR":
      return <BecomeCreator />;
    case "EDIT_FULLNAME":
      return <EditFullName />;
    case "EDIT_BIO":
      return <EditBio />;
    case "EDIT_SOCIAL_PROFILES":
      return <EditSocialProfiles />;
    case "EDIT_BIRTHDATE":
      return <EditBirthDate />;
    case "SIGN_OUT":
      return <SignOut />;
    case "REMOVE_PICTURE":
      return <RemovePicture />;
    case "EDIT_PROFILE_PICTURE":
      return <EditProfilePicture />;
    case "VERIFY_DELETE_ACCOUNT":
      return <OtpVerificationDeleteAccount />;
    case "DELETE_CONFIRMATION":
      return <DeleteAccount />;
  }
}
