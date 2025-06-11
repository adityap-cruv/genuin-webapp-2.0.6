import { useAuthenticationModalContext } from "./context";
import { CategoryInput } from "./screens/category-input";
import { EditEmail } from "./screens/edit-email";
import { EditPhoneNumber } from "./screens/edit-phone-number";
import { EditUserName } from "./screens/edit-username";
import { Guidelines } from "./screens/guidelines";
import { OtpVerification } from "./screens/otp";
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
  }
}
