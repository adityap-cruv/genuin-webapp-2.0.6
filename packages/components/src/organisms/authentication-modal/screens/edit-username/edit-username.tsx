import { FormControl, FormField, FormItem, FormMessage, Form, FormLabel } from "@genuin/ui/components/form";
import { Input } from "@genuin/ui/components/input";
import { Toast } from "@genuin/ui/components/toaster";
import { sanitizeInput } from "@genuin/ui/lib/sanitize";
import { cn } from "@genuin/ui/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ComponentProps } from "react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useDebounceValue } from "usehooks-ts";
import { z } from "zod";

import { useAnalytics } from "@genuin/components/context/analytics/context";
import { useAuthContext } from "@genuin/components/context/auth";
import { useUpdateUserMutation } from "@genuin/components/react-query/api/authentication";
import { useValidateUsername } from "@genuin/components/react-query/api/authentication/validate-username";

import { useAuthenticationModalContext } from "../../context";
import { SubmitButton } from "../../submit-button";

const usernameSchema = z.object({
  username: z.string().regex(/^[a-zA-Z0-9._-]+$/, {
    message: "Use only letters, numbers, underscores, or periods",
  }),
});

export function EditUserName({ className, ...restProps }: ComponentProps<"div">) {
  const { user, updateUser } = useAuthContext();
  const { closeModal } = useAuthenticationModalContext();
  const { track, EventName } = useAnalytics();

  const form = useForm<z.infer<typeof usernameSchema>>({
    resolver: zodResolver(usernameSchema),
    mode: "onChange",
    defaultValues: { username: user?.nickname },
  });

  const { mutate: validateUsername, isPending: isPendingValidateUser } = useValidateUsername({
    onSuccess: (isValid) => {
      // Only clear error if username is valid
      if (isValid) {
        form.clearErrors("username");
      } else {
        form.setError("username", {
          message: "This username isn't available. Choose a different username.",
        });
      }
    },
    onError: () => {
      form.setError("username", {
        message: "This username isn't available. Choose a different username.",
      });
    },
  });

  const { mutate: updateUserDetails, isPending: isPendingUpdateUser } = useUpdateUserMutation({
    onSuccess: ({ status }) => {
      if (status) {
        const username = form.getValues("username");
        updateUser({
          ...user,
          nickname: username,
          usernameSet: true,
        });

        // Track username set event
        track(EventName.KS_USERNAME_SET, {
          username: username,
          isNewUser: !user?.usernameSet,
        });

        Toast.Success({
          message: "Your username has been updated",
          description: "",
        });
      }
      closeModal();
    },
    onError: () => {
      form.setError("root", {
        message: "Something went wrong while updating username. Please try again!",
      });
    },
  });

  const usernameValue = form.watch("username");
  const [debouncedUsername] = useDebounceValue(usernameValue, 400);

  useEffect(() => {
    if (debouncedUsername && debouncedUsername !== user?.nickname) {
      validateUsername(sanitizeInput(debouncedUsername));
    } else {
      // If username is empty or unchanged, clear error
      form.clearErrors("username");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedUsername, user?.nickname]);

  const onSubmit = (data: z.infer<typeof usernameSchema>) => {
    updateUserDetails({ nickname: sanitizeInput(data.username) });
  };

  return (
    <div className={cn("gencl:space-y-6", className)} {...restProps}>
      <div className="gencl:space-y-2">
        <h3 className="gencl:text-center gencl:text-headline-2-semi-bold">Edit username</h3>
        <p className="gencl:text-center gencl:text-body-1-medium gencl:text-secondary-600">
          This handle will show on your videos
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="gencl:space-y-6">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => {
              const currentLength = field.value?.length || 0;
              return (
                <FormItem className="sm:w-full">
                  <FormLabel htmlFor="username-input" className="gencl:flex gencl:justify-between">
                    <span>Username</span>
                    <span className="gencl:text-secondary-500 gencl:text-body-2-medium">{currentLength}/25</span>
                  </FormLabel>
                  <FormControl>
                    <Input id="username-input" maxLength={25} type="text" autoComplete="off" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <SubmitButton
            disabled={!form.formState.isValid || isPendingUpdateUser || isPendingValidateUser}
            isLoading={isPendingUpdateUser || isPendingValidateUser}
            title="Save"
            error={form.formState.errors.root?.message ?? ""}
          />
        </form>
      </Form>
    </div>
  );
}
