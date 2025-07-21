import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@genuin/ui/components/form";
import { Input } from "@genuin/ui/components/input";
import { SubmitButton } from "../../submit-button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthContext } from "@genuin/components/context/auth";
import { ComponentProps, useCallback, useEffect } from "react";
import { useSendOtpMutation } from "@genuin/components/react-query/api/authentication";
import { useAuthenticationModalContext } from "../../context";
import { sanitizeInput } from "@genuin/components/lib/utils";
import { cn } from "@genuin/ui/lib/utils";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
});

export function EditEmail({ className, ...restProps }: ComponentProps<"div">) {
  const { user } = useAuthContext();
  const { setStep, setFormData } = useAuthenticationModalContext();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: { email: user?.email ?? "" },
  });

  const { mutate: sendOtp, isPending } = useSendOtpMutation({
    onError() {
      form.control.setError("root", {
        message: "Something went wrong while updating email. Please try again!",
      });
    },
    onSuccess(response) {
      if (response.codeSent) {
        setFormData({
          email: sanitizeInput(form.getValues("email")),
          preAuthSessionId: response.preAuthSessionId,
          responseDeviceId: response.resDeviceId,
        });
        setStep("VERIFY_MAIL_OTP");
      } else {
        form.control.setError("email", { message: response.message });
      }
    },
  });

  const onSubmit = useCallback(() => {
    sendOtp({ isUpdate: true, email: sanitizeInput(form.getValues("email")) });
  }, []);

  return (
    <div className={cn("gencl:space-y-6", className)} {...restProps}>
      <div className="gencl:space-y-2">
        <h3 className="gencl:text-center gencl:text-headline-2-semi-bold">
          Edit email address
        </h3>
        <p className="gencl:text-center gencl:text-body-1-medium gencl:text-secondary-600">
          Enter the email address where you would like to receive updates
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="gencl:space-y-6"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => {
              return (
                <FormItem>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <FormControl>
                    <Input type="email" id="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <SubmitButton
            disabled={!form.formState.isValid || !form.formState.isDirty}
            title="Save"
            isLoading={isPending}
            error={form.formState.errors.root?.message}
          />
        </form>
      </Form>
    </div>
  );
}
