"use client";
import { cn } from "@genuin/ui/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@genuin/ui/components/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  useFormField,
} from "@genuin/ui/components/form";
import { Input } from "@genuin/ui/components/input";
import { Textarea } from "@genuin/ui/components/textarea";
import { SendIcon } from "@genuin/ui/icons";
import { useContactUsMutation } from "@genuin/components/react-query/api/authentication/use-contact-us-mutation";
import { Toast } from "@genuin/ui/components";

const formSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email address is required" })
    .email({ message: "Please enter a valid email address" }),
  issue: z.string().trim().min(1, { message: "Please describe your issue." }),
});

export const ContactUs = ({ email }: { email: string }) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      issue: "",
      email: email ?? "",
    },
  });
  const { isValid, isDirty } = form.formState;
  const contactUsMutation = useContactUsMutation();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    contactUsMutation.mutate(
      {
        email: values.email,
        message: values.issue ?? "",
        type: "contact_us",
      },
      {
        onSuccess: () => {
          Toast.Success({
            message:
              "Your message has been sent. Our team will get back to you shortly.",
            description: "",
          });
          form.reset();
        },
        onError: (error: any) => {
          Toast.Error({
            message: error?.message || "Failed to send message.",
            description: "",
          });
        },
      }
    );
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="gencl:relative gencl:h-full gencl:w-full"
      >
        <h4 className="gencl:text-headline-4-medium gencl:mb-3">Contact Us</h4>
        <p className="gencl:text-left gencl:text-body-1-medium gencl:text-secondary-600 gencl:mb-4">
          Need help, experiencing problems or want to share feedback? Share the
          details below.
        </p>

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => {
            const errors = useFormField().error;
            return (
              <FormItem className="gencl:sm:w-full gencl:mb-4 gencl:mt-2">
                <FormLabel className="is-required">Email Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter Email Address"
                    className={cn(
                      "gencl:border gencl:border-tertiary-200 gencl:bg-tertiary-100 gencl:text-title-3-med",
                      errors && "!gencl:border-red"
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage className={cn("!gencl:text-cap-1-demi")} />
              </FormItem>
            );
          }}
        />

        <FormField
          name="issue"
          control={form.control}
          render={({ field }) => {
            const errors = useFormField().error;
            return (
              <FormItem className="gencl:sm:w-full gencl:mb-4 gencl:mt-2">
                <FormLabel className="is-required">
                  Describe your issue
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter Description"
                    {...field}
                    required
                    className={cn(
                      "gencl:border-tertiary-200 gencl:bg-tertiary-100 gencl:p-2 gencl:py-3 gencl:text-title-3-med gencl:h-30",
                      errors && "!border-red"
                    )}
                  />
                </FormControl>
                <FormMessage className={cn("!text-cap-1-demi")} />
              </FormItem>
            );
          }}
        />
        <span className="gencl:flex gencl:flex-col gencl:gap-y-3 gencl:text-title-3-demi">
          {form.formState.errors.root && (
            <p className="gencl:flex gencl:items-center gencl:justify-center gencl:text-title-3-med gencl:text-supplementary-red">
              {form.formState.errors.root.message}
            </p>
          )}
        </span>
        <div className="gencl:flex gencl:justify-end">
          <Button
            variant="default"
            type="submit"
            disabled={!isValid || !isDirty || contactUsMutation.isPending}
          >
            <SendIcon />
            <p className="gencl:text-new-para-2 gencl:text-tertiary-100">
              Send
            </p>
          </Button>
        </div>
      </form>
    </Form>
  );
};
