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
import { cn, sanitizeInput } from "@genuin/ui/lib/utils";
import { useAuthContext } from "@genuin/components/context/auth";
import { Textarea } from "@genuin/ui/components";
import { Toast } from "@genuin/ui/components";
import { SubmitButton } from "../../submit-button";
import { useAuthenticationModalContext } from "../../context";
import { useUpdateUserMutation } from "@genuin/components/react-query/api/authentication";

const formSchema = z.object({
  bio: z.string().max(150, { message: "Max length should be 150." }).optional(),
});

export function EditBio({ className, ...restProps }: ComponentProps<"div">) {
  const { user, updateUser } = useAuthContext();
  const { closeModal } = useAuthenticationModalContext();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { bio: user?.bio ?? "" },
    mode: "onChange",
  });

  const { mutate: updateUserDetails, isPending: isPendingUpdateUser } =
    useUpdateUserMutation({
      onSuccess: ({ status }) => {
        if (status) {
          updateUser({ ...user, bio: sanitizeInput(form.getValues("bio")) });
          Toast.Success({
            message: "Your bio has been updated",
          });
        }
        closeModal();
      },
      onError: () => {
        form.setError("root", {
          message: "Something went wrong while updating bio. Please try again!",
        });
      },
    });

  const onSubmit = () => {
    const bioValue = sanitizeInput(form.getValues("bio"));
    updateUserDetails({ bio: bioValue === "" ? null : bioValue });
  };

  return (
    <div className={cn("gencl:space-y-6", className)} {...restProps}>
      <div className="gencl:space-y-2">
        <h3 className="gencl:text-center gencl:text-headline-2-semi-bold">
          Edit Bio
        </h3>
        <p className="gencl:text-center gencl:text-body-1-medium gencl:text-secondary-600">
          This bio will show on your profile
        </p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="gencl:space-y-6"
        >
          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => {
              const currentLength = field.value?.length || 0;

              return (
                <FormItem className="sm:w-full">
                  <FormLabel
                    htmlFor="bio-input"
                    className="gencl:flex gencl:justify-between"
                  >
                    <span className="gencl:text-secondary-900">Bio</span>
                    <span className="gencl:text-secondary-500 gencl:text-body-2-medium">
                      {currentLength}/150
                    </span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      id="bio-input"
                      rows={4}
                      maxLength={150}
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
