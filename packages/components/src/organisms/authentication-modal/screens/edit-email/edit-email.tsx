import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@genuin/ui/components/form";
import { Input } from "@genuin/ui/components/input";
import { SubmitButton } from "../../submit-button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthContext } from "@context/auth";
import { ComponentProps, useCallback, useEffect } from "react";
import { useSendOtpMutation } from "@react-query/api/authentication";
import { useAuthenticationModalContext } from "../../context";
import { sanitizeInput } from "@genuin/components/lib/utils";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter valid email." }),
});

export function EditEmail({ ...restProps }: ComponentProps<"div">) {
  const { user } = useAuthContext();
  const { setStep, setFormData } = useAuthenticationModalContext();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: { email: user?.email ?? "" },
  });

  const { mutate: sendOtp } = useSendOtpMutation({
    onError() {
      form.control.setError("root", {
        message: "Something went wrong. Please try again!",
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

  useEffect(() => {
    form.control.setError("root", {
      message: "Something went wrong. Please try again!",
    });
  }, []);

  const onSubmit = useCallback(() => {
    sendOtp({ isUpdate: true, email: sanitizeInput(form.getValues("email")) });
  }, []);

  return (
    <div {...restProps}>
      <p className="gencl:text-center gencl:text-body-0-semi-bold gencl:pb-4">
        Email
      </p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => {
              return (
                <FormItem className="gencl:pb-3">
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage>
                    Verifying your email helps secure your account.
                  </FormMessage>
                </FormItem>
              );
            }}
          />
          <SubmitButton
            disabled
            title="Save"
            error={form.formState.errors.root?.message}
          />
        </form>
      </Form>
    </div>
  );
}
