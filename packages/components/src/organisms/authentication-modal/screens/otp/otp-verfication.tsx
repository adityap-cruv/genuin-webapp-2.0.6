import { Button } from "@genuin/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@genuin/ui/form";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@genuin/ui/input-otp";
import { TimerMessage } from "./timer";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuthenticationModalContext } from "../../context";
import {
  useConsumeOtpMutation,
  useSendOtpMutation,
  useUpdateEmailOrPhoneMutation,
} from "@react-query/api/authentication";
import { useAuthContext } from "@context/auth";
import { formatPhoneNumberIntl } from "react-phone-number-input";
import { SubmitButton } from "../../submit-button";

const OTPSchema = z.object({
  otp: z.string().min(6, { message: "OTP must be 6 digits." }),
});

type VerificationType = "LOGIN" | "EMAIL" | "PHONE";

type ResentOtpType = {
  email?: string;
  phoneNumber?: string;
};

type OtpVerificationProps = ComponentProps<"div"> & {
  verificationType: VerificationType;
  onNext?: (step?: string) => void;
};

export function OtpVerification({
  verificationType,
  title,
  ...props
}: OtpVerificationProps) {
  const {
    formData: { flowType, email, phone, preAuthSessionId, responseDeviceId },
    action,
    step,
    setStep,
    closeModal,
  } = useAuthenticationModalContext();

  const { signIn, updateUser } = useAuthContext();

  const form = useForm<z.infer<typeof OTPSchema>>({
    resolver: zodResolver(OTPSchema),
    defaultValues: {
      otp: "",
    },
  });

  const { mutate: consumeOtp, isPending } = useConsumeOtpMutation({
    onSuccess: async (data) => {
      if (data.otpVerified) {
        // If user is verified, sign in the user
        if (data.user) signIn({ ...data.user });

        // If user comes from action delete account
        if (action === "DELETE_ACCOUNT") {
          setStep("DELETE_CONFIRMATION");
        } else {
          if (!data.user?.brandGuidelines) {
            setStep?.("BRAND_GUIDELINES");
          } else if (!data.user.hasTopics) {
            setStep?.("CATEGORY_SELECTION");
          } else if (!data.user.usernameSet) {
            setStep?.("USERNAME_INPUT");
          } else {
            closeModal();
          }
        }
      } else {
        form.setError("otp", { message: "Invalid OTP" });
      }
    },
    onError: (error) => {
      form.setError("root", { message: "Error verifying OTP" });
      // Handle error during OTP verification
      // console.error("Error verifying OTP:", error);
    },
  });

  const { mutate: updateEmailOrPhone, isPending: updateEmailOrPhoneIsPending } =
    useUpdateEmailOrPhoneMutation({
      onError: () => {
        form.setError("root", { message: "Invalid OTP" });
      },
      onSuccess: ({ verified }) => {
        if (verified) {
          updateUser({ email, phoneNumber: phone });
        }
      },
    });

  const {
    mutate: sendOtp, // Changed back to mutate and aliased as sendOtp
    isPending: isSendingOtp,
    data,
  } = useSendOtpMutation({
    onSuccess: (response) => {
      // Ensure the 'response' object and its properties (codeSent, retryTime)
      // match the actual structure returned by your sendOtp mutation
      if (!response.codeSent) {
        form.setError("otp", {
          message: response.message,
        });
      }
    },
    onError: (error) => {
      // Handle any errors from the sendOtp mutation if necessary
      // For example, set a generic error message on the form
      form.setError("otp", {
        message: "An unexpected error occurred. Please try again.",
      });
      console.error("Error sending OTP:", error);
    },
  });

  function onSubmit(data: z.infer<typeof OTPSchema>) {
    // Ensure preAuthSessionId and responseDeviceId are available before calling consumeOtp
    if (!preAuthSessionId || !responseDeviceId) return;

    if (verificationType === "LOGIN") {
      consumeOtp({
        code: data.otp,
        email,
        phoneNumber: phone,
        preAuthSessionId,
        responseDeviceId,
      });
    } else {
      updateEmailOrPhone({
        code: data.otp,
        preAuthSessionId,
        responseDeviceId: responseDeviceId,
      });
    }
  }

  function resentOtp() {
    const isLoginFlow = step === "LOGIN_OTP_INPUT";
    const isEmailFlow = flowType === "EMAIL";

    let otpPayload: ResentOtpType & { isUpdate?: boolean } = {};

    if (isLoginFlow) {
      otpPayload = { email, phoneNumber: phone };
    } else if (isEmailFlow) {
      otpPayload = { email, isUpdate: true };
    } else {
      otpPayload = { phoneNumber: phone, isUpdate: true };
    }

    sendOtp(otpPayload);
  }

  return (
    <div className="gencl:text-center" {...props}>
      <p className="gencl:text-headline-2-semi-bold">{title ?? "Enter code"}</p>
      <p className="gencl:text-body-1-medium gencl:text-secondary-600 gencl:mt-3">
        Please Enter the 6-digit code sent to
        {flowType === "EMAIL"
          ? `your email address: ${email}`
          : `your phone: ${formatPhoneNumberIntl(phone as string)}`}
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="gencl:space-y-4 gencl:mt-4"
        >
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputOTP
                    containerClassName="gencl:w-full"
                    maxLength={6}
                    {...field}
                    value={field.value} // Ensure value is controlled by react-hook-form
                    onChange={(value) => {
                      field.onChange(value); // Update react-hook-form field value
                    }}
                  >
                    <InputOTPGroup className="gencl:w-full gencl:flex gencl:gap-4">
                      {[...Array(6)].map((_, idx) => (
                        <InputOTPSlot
                          key={idx}
                          index={idx}
                          className="gencl:w-full gencl:h-16 gencl:border-0 gencl:rounded-lg gencl:bg-secondary-50"
                        />
                      ))}
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <TimerMessage
            className="gencl:mt-4"
            time={data?.retryTime ?? 30}
            isOtpSending={isSendingOtp}
            verificationType="login"
            resentOtp={resentOtp}
          />
          <SubmitButton
            title="Verify"
            disabled={
              !form.formState.isValid ||
              isPending ||
              updateEmailOrPhoneIsPending
            }
            isLoading={isPending || updateEmailOrPhoneIsPending}
            error={form.formState.errors.root?.message || ""}
          />
        </form>
      </Form>
    </div>
  );
}
