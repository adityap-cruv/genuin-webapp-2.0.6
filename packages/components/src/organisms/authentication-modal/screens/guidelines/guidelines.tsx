"use client";

import { Checkbox } from "@genuin/ui/checkbox";
import type { ComponentProps } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@genuin/ui/components/form";
import { useState } from "react";

import { useBaseContext } from "src/context/base";
import { BrandLogo } from "src/molecules/brand";
import {
  useAcceptGuidelinesMutation,
  useGetGuidelines,
} from "@react-query/api/authentication";
import { useAuthContext } from "@/context/auth";
import { useAuthenticationModalContext } from "../../context";
import { SubmitButton } from "../../submit-button";

type GuidelinesProps = ComponentProps<"div">;

type GuidelinesFormValues = {
  accepted: boolean;
};

export function Guidelines({ ...props }: GuidelinesProps) {
  const { brandDetails } = useBaseContext();
  const { user, updateUser } = useAuthContext();
  const { setStep, closeModal } = useAuthenticationModalContext();
  const { data: guidelines, isLoading } = useGetGuidelines({
    brandId: brandDetails?.brand_id,
    isDefaultId: false,
  });

  const { mutate: acceptGuidelines, isPending } = useAcceptGuidelinesMutation({
    onSuccess: () => {
      updateUser({ brandGuidelines: true });
      if (!user?.hasTopics) {
        setStep("CATEGORY_SELECTION");
      } else if (!user?.usernameSet) {
        setStep("USERNAME_INPUT");
      } else {
        closeModal();
      }
    },
    onError: (error) => {
      form.setError("root", { message: "Please try again." });
    },
  });

  const form = useForm<GuidelinesFormValues>({
    defaultValues: { accepted: false },
    mode: "onChange",
  });
  const formState = form.formState;

  const onSubmit: SubmitHandler<GuidelinesFormValues> = (data) => {
    if (data.accepted) {
      acceptGuidelines(undefined, {});
    }
  };

  return (
    <div {...props}>
      <BrandLogo />
      <div className="gencl:w-full gencl:mt-5">
        <h2 className="gencl:text-headline-3-bold">Brand Guidelines</h2>
        <p className="gencl:text-body-1-medium gencl:font-normal gencl:mt-3">
          Welcome to Genuin! As you get settled, we wanted to introduce you to
          our Platform Guidelines. To keep Genuin a space for authentic
          connection and ongoing learning, here are a few ground rules, you, as
          a user, acknowledge and agree to by using this platform.
        </p>
        <div className="gencl:overflow-y-auto gencl:max-h-[40vh]">
          {isLoading ? (
            <div className="gencl:mt-3 gencl:text-body-1-medium gencl:font-normal">
              Loading guidelines...
            </div>
          ) : (
            guidelines?.map((guideline, index) => (
              <div
                key={index}
                className="gencl:mt-3 gencl:text-body-1-medium gencl:font-normal"
              >
                <span className="gencl:font-semibold">{guideline.title}: </span>
                {guideline.description}
              </div>
            ))
          )}
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="gencl:mt-5">
          <FormField
            control={form.control}
            name="accepted"
            rules={{ required: "You must agree to the guidelines" }}
            render={({ field }) => (
              <FormItem>
                <div className="gencl:flex gencl:items-center gencl:justify-start gencl:gap-3 gencl:px-4 gencl:py-3 gencl:rounded-lg gencl:border gencl:border-secondary-100">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      className="gencl:rounded-full gencl:w-5 gencl:h-5 gencl:fill-white"
                    />
                  </FormControl>
                  <p className="gencl:text-body-1-medium">
                    I agree to the guidelines
                  </p>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          <SubmitButton
            type="submit"
            title="Continue"
            isLoading={isPending}
            disabled={!formState.isValid || isPending}
            className="gencl:w-full gencl:mt-5"
            error={formState.errors.root?.message || ""}
          />
        </form>
      </Form>
    </div>
  );
}
