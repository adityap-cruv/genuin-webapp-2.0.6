import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@genuin/ui/components/form";
import { PhoneInput } from "@genuin/ui/components/phone-input";
import { SubmitButton } from "../../submit-button";
import { z } from "zod";
import { isValidPhoneNumber } from "react-phone-number-input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuthContext } from "@genuin/components/context/auth";
import { ComponentProps, useCallback } from "react";
import { useSendOtpMutation } from "@genuin/components/react-query/api/authentication";
import { useAuthenticationModalContext } from "../../context";
import { sanitizeInput } from "@genuin/components/lib/utils";

const phoneFormSchema = z.object({
  phone: z.string().refine((val) => isValidPhoneNumber(val), {
    message: "Please enter a valid phone number.",
  }),
});

export function EditPhoneNumber({ ...restProps }: ComponentProps<"div">) {
  const { user } = useAuthContext();
  const { setFormData, setStep } = useAuthenticationModalContext();

  const { mutate: sendOtp, isPending } = useSendOtpMutation({
    onError() {
      form.control.setError("root", {
        message: "Something went wrong. Please try again!",
      });
    },
    onSuccess(response) {
      if (response.codeSent) {
        setFormData({
          email: sanitizeInput(form.getValues("phone")),
          preAuthSessionId: response.preAuthSessionId,
          responseDeviceId: response.resDeviceId,
        });
        setStep("VERIFY_PHONE_OTP");
      } else {
        form.control.setError("phone", { message: response.message });
      }
    },
  });

  const form = useForm<z.infer<typeof phoneFormSchema>>({
    resolver: zodResolver(phoneFormSchema),
    mode: "onSubmit",
    criteriaMode: "firstError",
    defaultValues: {
      phone: user?.phoneNumber ?? "",
    },
  });

  const onSubmit = useCallback(() => {
    sendOtp({
      phoneNumber: sanitizeInput(form.getValues("phone")),
      isUpdate: true,
    });
  }, []);

  return (
    <div {...restProps}>
      <p className="gencl:text-center gencl:text-body-0-semi-bold gencl:pb-4">
        Phone
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => {
              return (
                <FormItem className="sm:w-full">
                  <FormControl>
                    <PhoneInput
                      value={"+1" as string & { __tag: "E164Number" }}
                      international
                      className="w-full"
                      onChange={(value) => {
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage>
                    Verifying your phone number helps secure your account.
                  </FormMessage>
                </FormItem>
              );
            }}
          />
          <SubmitButton
            title="Save"
            disabled={
              !isValidPhoneNumber(form.watch("phone") ?? "") || isPending
            }
            error={form.formState.errors.root?.message || ""}
          />
        </form>
      </Form>
    </div>
  );
}
