import { ComponentProps, useCallback } from "react";
import { sanitizeInput } from "@genuin/components/lib/utils";
import { cn } from "@genuin/ui/lib/utils";
import { useAuthenticationModalContext } from "../../context";
import { Button } from "@genuin/ui/components";
import { useAuthContext } from "@genuin/components/context/auth";
import { useForm } from "react-hook-form";
import { useSendOtpMutation } from "@genuin/components/react-query/api/authentication";

export function DeleteAccount({
  className,
  ...restProps
}: ComponentProps<"div">) {
  const { closeModal, setFormData, setStep } = useAuthenticationModalContext();

  const { user } = useAuthContext();

  const {
    mutate: sendOtp, // Changed back to mutate and aliased as sendOtp
  } = useSendOtpMutation({
    onSuccess: (response) => {
      // Ensure the 'response' object and its properties (codeSent, retryTime)
      // match the actual structure returned by your sendOtp mutation
      if (response.codeSent) {
        setFormData({
          preAuthSessionId: response.preAuthSessionId,
          responseDeviceId: response.resDeviceId,
          phone: user?.phoneNumber,
          email: user?.email,
        });
        setStep("VERIFY_DELETE_ACCOUNT");
      } else {
        emailForm.setError("email", {
          message: response.message,
        });
      }
    },
    onError: (error) => {
      // Handle any errors from the sendOtp mutation if necessary
      // For example, set a generic error message on the form
      emailForm.setError("email", {
        message: "An unexpected error occurred. Please try again.",
      });
      console.error("Error sending OTP:", error);
    },
  });

  // Email form
  const emailForm = useForm({
    mode: "onSubmit", // enables button as soon as valid
    reValidateMode: "onChange", // errors only show on blur or submit
    defaultValues: { email: user?.email ?? "" },
    criteriaMode: "firstError",
  });

  const handleEmailSubmit = useCallback(() => {
    const sanitizedEmail = sanitizeInput(user?.email);
    setFormData({ email: sanitizedEmail });
    sendOtp({ email: sanitizedEmail, isUpdate: false });
  }, [sendOtp, setFormData, user?.email]);

  return (
    <div className={cn("gencl:space-y-5", className)} {...restProps}>
      <div className="gencl:space-y-2">
        <h3 className="gencl:text-left gencl:text-headline-4-semi-bold gencl:mb-5">
          Delete account?
        </h3>
        <p className="gencl:text-left gencl:text-body-1-medium">
          Are you sure you want to delete your account? This step cannot be
          undone.
        </p>
      </div>
      <div className="gencl:flex gencl:gap-5 gencl:justify-end">
        <Button theme="text" onClick={closeModal}>
          Cancel
        </Button>
        <Button onClick={handleEmailSubmit}>Delete</Button>
      </div>
    </div>
  );
}
