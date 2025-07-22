import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@genuin/ui/components/form";
import { PhoneInput } from "@genuin/ui/components/phone-input";
import { ComponentProps, useCallback } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import {
  formatPhoneNumber,
  formatPhoneNumberIntl,
  isValidPhoneNumber,
} from "react-phone-number-input";
import { sanitizeInput } from "@genuin/components/lib/utils";
import { cn } from "@genuin/ui/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthContext } from "@genuin/components/context/auth";
import { useSendOtpMutation } from "@genuin/components/react-query/api/authentication";
import { useAuthenticationModalContext } from "../../context";
import { SubmitButton } from "../../submit-button";

const phoneFormSchema = z.object({
  phone: z.string().refine((val) => isValidPhoneNumber(val), {
    message: "Please enter a valid phone number.",
  }),
});

export function EditPhoneNumber({
  className,
  ...restProps
}: ComponentProps<"div">) {
  const { user } = useAuthContext();
  const { setFormData, setStep } = useAuthenticationModalContext();

  const { mutate: sendOtp, isPending } = useSendOtpMutation({
    onError() {
      form.control.setError("root", {
        message: "Something went wrong while updating phone. Please try again!",
      });
    },
    onSuccess(response) {
      if (response.codeSent) {
        setFormData({
          phone: sanitizeInput(form.getValues("phone")),
          preAuthSessionId: response.preAuthSessionId,
          responseDeviceId: response.resDeviceId,
        });
        setStep("VERIFY_PHONE_OTP");
      } else {
        form.control.setError("phone", { message: response.message });
      }
    },
  });

  const phoneNumberValue = user?.phoneNumber
    ? user.phoneNumber.startsWith("+")
      ? user.phoneNumber
      : `+${user.phoneNumber}`
    : "";

  const form = useForm<z.infer<typeof phoneFormSchema>>({
    resolver: zodResolver(phoneFormSchema),
    defaultValues: { phone: phoneNumberValue },
    criteriaMode: "firstError",
    mode: "onChange",
  });

  const onSubmit = useCallback(() => {
    sendOtp({
      phoneNumber: sanitizeInput(form.getValues("phone")),
      isUpdate: true,
    });
  }, []);

  return (
    <div className={cn("gencl:space-y-6", className)} {...restProps}>
      <div className="gencl:space-y-2">
        <h3 className="gencl:text-center gencl:text-headline-2-semi-bold">
          Edit phone number
        </h3>
        <p className="gencl:text-center gencl:text-body-1-medium gencl:text-secondary-600">
          Enter the phone number where you would like to receive updates
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="gencl:space-y-6"
        >
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => {
              return (
                <FormItem className="sm:w-full">
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <PhoneInput
                      value={field.value as string & { __tag: "E164Number" }}
                      international
                      className="w-full"
                      onChange={(value) => {
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage className={cn("!text-cap-1-demi")} />
                </FormItem>
              );
            }}
          />
          <SubmitButton
            title="Save"
            disabled={
              !isValidPhoneNumber(form.watch("phone") ?? "") || isPending
            }
            isLoading={isPending}
            error={form.formState.errors.root?.message || ""}
          />
        </form>
      </Form>
    </div>
  );
}
