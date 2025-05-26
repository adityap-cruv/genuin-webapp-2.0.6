import {
  Form,
  FormControl,
  FormItem,
  FormField,
  FormMessage,
  useFormField,
} from "@genuin/ui/form";
import { Input } from "@genuin/ui/input";
import { cn, sanitizeInput } from "@genuin/ui/utils";
import { Button } from "@genuin/ui/button";
import { ModalShell } from "../modal-shell";
import { FooterInfo } from "../components/footer-info";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { PhoneInput } from "@genuin/ui/phone-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import { useState, useEffect } from "react";
import { type ScreenProps } from ".";
import { sendOtp } from "../api/auth";
import { useAuthenticationModal } from "../context";
import { Loader } from "@genuin/ui/loader";

export function Starter({ onBack, onNext }: ScreenProps) {
  const {
    formData: { flowType },
  } = useAuthenticationModal();
  // const { flowType } = useAuthenticationModalStore(
  //   useShallow((state) => ({
  //     flowType: state.formData.flowType,
  //     setFormData: state.setFormData,
  //   }))
  // );

  return (
    <ModalShell>
      <span className="gencl:text-center">
        <h3 className="gencl:text-title-1-demi" style={{ fontSize: "32px" }}>
          Log in or sign up
        </h3>
        <p className="gencl:pt-3 gencl:text-title-3-med gencl:text-secondary-300">
          We'll send you a code to log in or create an account.
        </p>
      </span>
      <div className="gencl:w-full">
        {flowType === "email" ? (
          <EmailForm onNext={onNext} />
        ) : (
          <NumberForm onNext={onNext} />
        )}
      </div>
      <FooterInfo />
    </ModalShell>
  );
}

const emailFormSchema = z.object({
  email: z.string().email({ message: "Please enter valid email." }),
});

function EmailForm({ onNext }: { onNext: () => void }) {
  const {
    setFormData,
    formData: { email },
  } = useAuthenticationModal();

  const form = useForm<z.infer<typeof emailFormSchema>>({
    resolver: zodResolver(emailFormSchema),
    mode: "onBlur",
    defaultValues: {
      email,
    },
  });
  const [isLoading, setIsLoading] = useState(false);
  const { isValid } = form.formState;

  useEffect(() => {
    const watching = form.watch((value) => {
      setFormData({ email: value.email });
    });
    return () => {
      watching.unsubscribe();
    };
  }, [form.watch]);

  async function handleSubmit({ email }: { email: string }) {
    setIsLoading(true);
    const response = await sendOtp({ email: sanitizeInput(email) });
    if (response.codeSent) {
      onNext();
    } else {
      const minutes = Math.floor(response.retryTime / 60);
      if (minutes >= 1) {
        const leftSeconds = response.retryTime % 60;
        form.setError("email", {
          message: `Please try again after ${minutes < 10 ? `0${minutes}` : minutes}:${
            leftSeconds < 10 ? `0${leftSeconds}` : leftSeconds
          } minutes!`,
        });
      } else {
        form.setError("email", {
          message: `Please try again after 00:${
            response.retryTime < 10
              ? `0${response.retryTime}`
              : response.retryTime
          }!`,
        });
      }
    }
    setIsLoading(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => {
            const errors = useFormField().error;
            return (
              <FormItem className="gencl:sm:w-full">
                <FormControl>
                  <Input
                    placeholder="Enter Email"
                    className={cn(
                      "gencl:border gencl:border-tertiary-200 gencl:bg-tertiary-100 gencl:!text-title-3-med gencl:placeholder:!text-tertiary-300",
                      errors && "gencl:border-red!"
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage className={cn("gencl:text-cap-1-demi!")} />
              </FormItem>
            );
          }}
        />
        <Button
          type="submit"
          className="gencl:w-full"
          disabled={!isValid || isLoading}
        >
          {isLoading ? (
            <Loader size="sm" className="gencl:fill-white gencl:stroke-white" />
          ) : (
            <p className="gencl:text-body-1-demi gencl:text-white">Continue</p>
          )}
        </Button>
      </form>
    </Form>
  );
}

const phoneNumberSchema = z.object({ phone: z.string() });

function NumberForm({ onNext }: { onNext: () => void }) {
  const {
    formData: { phoneNumber },
    setFormData,
  } = useAuthenticationModal();
  // const { setFormData, phoneNumber } = useAuthenticationModalStore(
  //   useShallow((state) => ({
  //     setFormData: state.setFormData,
  //     phoneNumber: state.formData.phoneNumber,
  //   }))
  // );
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof phoneNumberSchema>>({
    resolver: zodResolver(phoneNumberSchema),
    mode: "onSubmit",
    criteriaMode: "firstError",
    defaultValues: {
      phone: phoneNumber ?? "+1",
    },
  });

  async function onSubmit() {
    console.log("onSubmit");
    setIsLoading(true);
    const response = await sendOtp({ phoneNumber });
    if (response.codeSent) {
      onNext();
    } else {
      form.setError("phone", {
        message: response.message,
      });
    }
    setIsLoading(false);
  }

  useEffect(() => {
    return () => {
      if (!isValidPhoneNumber(form.getValues().phone)) {
        setFormData({ phoneNumber: "" });
      }
    };
  }, [form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => {
            return (
              <FormItem className="gencl:sm:w-full">
                <FormControl>
                  <PhoneInput
                    value={field.value as any}
                    international
                    className="gencl:w-full"
                    onChange={(value) => {
                      form.setValue("phone", value);
                      setFormData({ phoneNumber: value });
                    }}
                  />
                </FormControl>
                <FormMessage className={cn("gencl:text-cap-1-demi!")} />
              </FormItem>
            );
          }}
        />
        <Button
          type="submit"
          className="gencl:w-full"
          disabled={!isValidPhoneNumber(phoneNumber ?? "") || isLoading}
        >
          {isLoading ? (
            <Loader size="sm" className="gencl:fill-white gencl:stroke-white" />
          ) : (
            <p className="gencl:text-body-1-demi gencl:text-white">Continue</p>
          )}
        </Button>
      </form>
    </Form>
  );
}
