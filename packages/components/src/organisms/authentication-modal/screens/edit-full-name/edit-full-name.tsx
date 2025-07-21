import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
  Form,
  FormLabel,
} from "@genuin/ui/components/form";
import { ComponentProps } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthContext } from "@genuin/components/context/auth";
import { useUpdateUserMutation } from "@genuin/components/react-query/api/authentication";
import { cn } from "@genuin/ui/lib/utils";
import { Input } from "@genuin/ui/components";
import { Toast } from "@genuin/ui/components";
import { useAuthenticationModalContext } from "../../context";
import { SubmitButton } from "../../submit-button";

const nameRegex = /^[a-zA-Z0-9 ]+$/i;

const formSchema = z.object({
  fullname: z
    .string()
    .regex(nameRegex, {
      message: "Name can only have letters, numbers, or spaces",
    })
    .max(25, { message: "Max length should be 25." })
    .optional(),
});

export function EditFullName({
  className,
  ...restProps
}: ComponentProps<"div">) {
  const { user, updateUser } = useAuthContext();
  const { closeModal } = useAuthenticationModalContext();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { fullname: user?.name || "" },
    mode: "onChange",
  });

  const { mutate: updateUserDetails, isPending: isPendingUpdateUser } =
    useUpdateUserMutation({
      onSuccess: ({ status }) => {
        if (status) {
          updateUser({ ...user, name: form.getValues("fullname") });
          Toast.Success({
            message: "Your full name has been updated",
          });
        }
        closeModal();
      },
      onError: () => {
        form.setError("root", {
          message:
            "Something went wrong while updating name. Please try again!",
        });
      },
    });

  const onSubmit = () => {
    const fullNameValue = form.getValues("fullname");
    updateUserDetails({ name: fullNameValue === "" ? null : fullNameValue });
  };

  return (
    <div className={cn("gencl:space-y-6", className)} {...restProps}>
      <div className="gencl:space-y-2">
        <h3 className="gencl:text-center gencl:text-headline-2-semi-bold">
          Edit full name
        </h3>
        <p className="gencl:text-center gencl:text-body-1-medium gencl:text-secondary-600">
          This name will show on your videos
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="gencl:space-y-6"
        >
          <FormField
            control={form.control}
            name="fullname"
            render={({ field }) => {
              const currentLength = field.value?.length || 0;
              return (
                <FormItem className="sm:w-full">
                  <FormLabel
                    htmlFor="fullname-input"
                    className="gencl:flex gencl:justify-between"
                  >
                    <span>Full Name</span>
                    <span className="gencl:text-secondary-500 gencl:text-body-2-medium">
                      {currentLength}/25
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      id="fullname-input"
                      maxLength={25}
                      type="text"
                      autoComplete="off"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <SubmitButton
            disabled={!form.formState.isValid || !form.formState.isDirty}
            isLoading={isPendingUpdateUser}
            title="Save"
            error={form.formState.errors.root?.message ?? ""}
          />
        </form>
      </Form>
    </div>
  );
}
