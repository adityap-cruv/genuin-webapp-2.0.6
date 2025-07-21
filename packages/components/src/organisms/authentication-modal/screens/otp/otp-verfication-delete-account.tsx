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
import { useState, type ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useAuthenticationModalContext } from "../../context";
import {
  deleteUserAccount,
  useConsumeOtpMutation,
  useSendOtpMutation,
} from "@genuin/components/react-query/api/authentication";
import { useAuthContext } from "@genuin/components/context/auth";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { SubmitButton } from "../../submit-button";

const OTPSchema = z.object({
  otp: z.string().min(6, { message: "OTP must be 6 digits." }),
});

type ResentOtpType = {
  email?: string;
  phoneNumber?: string;
};

type OtpVerificationDeleteAccountProps = ComponentProps<"div"> & {
  onNext?: (step?: string) => void;
};

export function OtpVerificationDeleteAccount({
  title,
  className,
  ...props
}: OtpVerificationDeleteAccountProps) {
  const {
    formData: { email, phone, preAuthSessionId, responseDeviceId },
    // setStep,
    closeModal,
  } = useAuthenticationModalContext();
  const { user } = useAuthContext();
  const { signOut } = useAuthContext();

  const [error, setError] = useState("");

  const form = useForm<z.infer<typeof OTPSchema>>({
    resolver: zodResolver(OTPSchema),
    defaultValues: {
      otp: "",
    },
  });

  const { mutate: consumeOtp, isPending } = useConsumeOtpMutation({
    onSuccess: async (data) => {
      console.log("OTP verification successful:", data);
      if (data.otpVerified) {
        onDelete();
      } else {
        form.setError("otp", { message: "Invalid OTP" });
      }
    },
    onError: (error) => {
      form.setError("root", { message: "Error verifying OTP" });
      // Handle error during OTP verification
      console.error("Error verifying OTP:", error);
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

    consumeOtp({
      code: data.otp,
      email,
      phoneNumber: phone,
      preAuthSessionId,
      responseDeviceId,
    });
  }

  function resentOtp() {
    let otpPayload: ResentOtpType & { isUpdate?: boolean } = {};
    otpPayload = { email: user?.email, isUpdate: true };
    sendOtp(otpPayload);
  }

  async function onDelete() {
    await deleteUserAccount().then(async (res) => {
      if (res?.code === 200) {
        signOut(buildPageUrl({ type: "home" }));
        closeModal();
      } else if (res?.code === 5250) {
        setError("The Account deletion is not permitted for this user");
      } else {
        setError("Something went wrong please try again after sometime!");
      }
    });
  }

  return (
    <div className="gencl:text-center" {...props}>
      <p className="gencl:text-headline-2-semi-bold">Enter code</p>
      <p className="gencl:text-body-1-medium gencl:text-secondary-600 gencl:mt-3 gencl:mb-3">
        Please Enter the 6-digit code sent to your email address : {user?.email}
      </p>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="gencl:space-y-6 gencl:text-center"
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
                          className="gencl:w-full gencl:h-16 gencl:rounded-lg gencl:bg-secondary-50 gencl:border gencl:border-secondary-150"
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
            time={data?.retryTime ?? 30}
            isOtpSending={isSendingOtp}
            verificationType="login"
            resentOtp={resentOtp}
          />
          <SubmitButton
            title="Verify"
            disabled={!form.formState.isValid || isPending}
            isLoading={isPending}
            error={form.formState.errors.root?.message || ""}
          />
        </form>
      </Form>
    </div>
  );
}
