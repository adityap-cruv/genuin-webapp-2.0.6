import { Input } from "@genuin/ui/input";
import { PhoneInput } from "@genuin/ui/phone-input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@genuin/ui/form";
import { ComponentProps, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useBaseContext } from "@genuin/components/context/base";
import { Link } from "@genuin/components/molecules/link";
import { SubmitButton } from "../../submit-button";
import { cn } from "@genuin/ui/lib/utils";
import { useSendGetAppLinkMutation } from "@genuin/components/react-query/api/get-app";
import { Toast } from "@genuin/ui/components/toaster";
import { useSearchParams } from "@genuin/components/hooks/use-search-params";

// Form validation schema
const formSchema = z
  .object({
    phoneNumber: z.string().optional(),
    email: z.string().email("Please enter a valid email address").optional(),
  })
  .refine((data) => data.phoneNumber || data.email, {
    message: "Please provide either a phone number or email address",
    path: ["phoneNumber"], // Show error on phone number field
  });

type FormData = z.infer<typeof formSchema>;

export type AppDownloadFormProps = ComponentProps<"div">;

export function AppDownloadForm({
  onSubmit,
  className,
  ...props
}: AppDownloadFormProps) {
  const { brandDetails } = useBaseContext();
  const { searchParams } = useSearchParams();
  const [error, setError] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      phoneNumber: "",
      email: "",
    },
  });

  const { mutate: sendAppLink, isPending } = useSendGetAppLinkMutation({
    onError(error) {
      setError("Failed to send link. Please try again.");
      Toast.Error({ message: "Failed to send link. Please try again." });
    },
    onSuccess() {
      Toast.Success({ message: "Link sent successfully!" });
    },
  });

  const handleSubmit = (data: FormData) => {
    sendAppLink({
      email: data.email,
      mobile: data.phoneNumber,
      query_params: searchParams.toString(),
    });
  };

  return (
    <div className={cn("gencl:space-y-6", className)} {...props}>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleSubmit)}
          className="gencl:space-y-2"
        >
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <PhoneInput
                    value={field.value as string & { __tag: "E164Number" }}
                    onChange={field.onChange}
                    placeholder="Enter your phone number"
                    defaultCountry="US"
                    international
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter Email..."
                    className="gencl:rounded-lg gencl:border gencl:border-secondary-300 gencl:p-2 gencl:pl-3"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <SubmitButton
            disabled={isPending || !form.formState.isValid}
            isLoading={isPending}
            error={error}
            title="Send Link"
            className="gencl:mt-4 gencl:w-full"
          />
        </form>
      </Form>
      <p className="gencl:text-center gencl:text-secondary-300 gencl:text-body-2-medium">
        By clicking Send Link, I acknowledge that I have read the{" "}
        <Link
          href={brandDetails?.privacy_policy ?? ""}
          className="gencl:underline"
        >
          Privacy Policy
        </Link>{" "}
        and agree to the{" "}
        <Link
          href={brandDetails?.terms_and_condition ?? ""}
          className="gencl:underline"
        >
          Terms of Service
        </Link>
      </p>
    </div>
  );
}

export type { FormData as AppDownloadFormData };
