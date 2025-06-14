"use client";

import { Button } from "@genuin/ui/button";
import { Input } from "@genuin/ui/input";
import { PhoneInput } from "@genuin/ui/phone-input";
import { useCallback } from "react";
import type * as RPNInput from "react-phone-number-input";
import { Footer } from "./footer";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { isValidPhoneNumber } from "react-phone-number-input";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@genuin/ui/form";
import { useSendOtpMutation } from "@genuin/components/react-query/api/authentication";
import { sanitizeInput } from "@genuin/components/lib/utils";
import { useAuthenticationModalContext } from "../../context";
import { useAuthContext } from "@genuin/components/context/auth";
import { SubmitButton } from "../../submit-button";

type SignInProps = React.ComponentProps<"div"> & {
  onSubmit?: (value: string, type: "email" | "phone") => void;
  onNext?: () => void; // Added onNext prop
  className?: string;
  email?: boolean;
};

const emailFormSchema = z.object({
  email: z.string().email({ message: "Please enter valid email." }),
});

const phoneFormSchema = z.object({
  phone: z.string().refine((val) => isValidPhoneNumber(val), {
    message: "Please enter a valid phone number.",
  }),
});

export function SignIn({
  onSubmit,
  onNext = () => {},
  email = false,
  ...props
}: SignInProps) {
  const { user } = useAuthContext();
  const {
    setFormData,
    formData: { flowType },
  } = useAuthenticationModalContext();

  const {
    mutate: sendOtp, // Changed back to mutate and aliased as sendOtp
    isPending,
  } = useSendOtpMutation({
    onSuccess: (response) => {
      // Ensure the 'response' object and its properties (codeSent, retryTime)
      // match the actual structure returned by your sendOtp mutation
      if (response.codeSent) {
        setFormData({
          preAuthSessionId: response.preAuthSessionId,
          responseDeviceId: response.resDeviceId,
        });

        onNext();
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
  const emailForm = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    mode: "onSubmit", // enables button as soon as valid
    reValidateMode: "onChange", // errors only show on blur or submit
    defaultValues: { email: user?.email ?? "" },
    criteriaMode: "firstError",
  });

  // Phone form
  const phoneForm = useForm<z.infer<typeof phoneFormSchema>>({
    resolver: zodResolver(phoneFormSchema),
    mode: "onBlur",
    defaultValues: { phone: user?.phoneNumber ?? "" },
  });

  // Email submit
  const handleEmailSubmit = useCallback(
    ({ email }: { email: string }) => {
      setFormData({ email: sanitizeInput(email) }); // Store sanitized email in context
      sendOtp({ email: sanitizeInput(email), isUpdate: false });
    },
    [sendOtp]
  );

  // Phone submit
  const handlePhoneSubmit = useCallback(
    ({ phone }: { phone: string }) => {
      setFormData({ phone: sanitizeInput(phone) }); // Store sanitized phone in context
      sendOtp({ phoneNumber: sanitizeInput(phone), isUpdate: false });
    },
    [sendOtp]
  );

  return (
    <div className="gencl:text-center" {...props}>
      <div className="gencl:flex gencl:flex-col gencl:gap-3">
        <h2 className="gencl:text-headline-2-semi-bold">Sign in</h2>
        <p className="gencl:text-body-1-medium gencl:text-secondary-600">
          We'll send you a code to sign in or create an account.
        </p>
      </div>
      <div className="gencl:flex gencl:flex-col gencl:gap-4 gencl:mt-6">
        {flowType === "EMAIL" ? (
          <Form {...emailForm} key="email">
            <form
              onSubmit={emailForm.handleSubmit(handleEmailSubmit)}
              className="gencl:flex gencl:flex-col gencl:gap-4"
            >
              <FormField
                control={emailForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input placeholder="Enter Email..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SubmitButton
                disabled={!emailForm.formState.isValid || isPending}
                isLoading={isPending}
              />
            </form>
          </Form>
        ) : (
          <Form {...phoneForm} key="phone">
            <form
              onSubmit={phoneForm.handleSubmit(handlePhoneSubmit)}
              className="gencl:flex gencl:flex-col gencl:gap-4"
            >
              <FormField
                control={phoneForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <PhoneInput
                        onChange={(value) => field.onChange(value || "")}
                        placeholder="Enter Phone Number"
                        value={field.value as RPNInput.Value}
                        defaultCountry="US"
                        disabled={isPending}
                        international
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <SubmitButton
                type="submit"
                title="Continue"
                isLoading={isPending}
                disabled={!isValidPhoneNumber(phoneForm.watch("phone") || "")}
              />
            </form>
          </Form>
        )}
      </div>
      <Footer />
    </div>
  );
}
