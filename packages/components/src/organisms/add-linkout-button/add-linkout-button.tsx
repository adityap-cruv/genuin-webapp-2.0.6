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
import { Toast } from "@genuin/ui/components";
import { useEffect } from "react";

const BUTTON_TEXT_LENGTH = 25;

const formSchema = z.object({
  url: z.string().url().min(1, { message: "Button url is required" }),
  text: z
    .string()
    .trim()
    .min(1, { message: "Button text is required." })
    .max(BUTTON_TEXT_LENGTH, {
      message: `Max length should be ${BUTTON_TEXT_LENGTH}`,
    }),
});

export const AddButton = ({
  button,
  onCancel,
  onSubmit: onSubmitProp,
}: {
  button?: {
    url: string;
    text: string;
  };
  onCancel?: () => void;
  onSubmit?: (data: { url: string; text: string }) => void;
}) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      url: button?.url || "",
      text: button?.text || "",
    },
  });
  const { isValid, isDirty } = form.formState;

  async function onSubmit(values: z.infer<typeof formSchema>) {
    onSubmitProp?.({ ...values });
  }

  useEffect(() => {
    form.reset({
      url: button?.url ?? "",
      text: button?.text ?? "",
    });
  }, [button, form]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="gencl:bg-white gencl:relative gencl:h-full gencl:w-full gencl:border gencl:border-secondary-150 gencl:p-4 gencl:rounded-lg"
      >
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => {
            const errors = useFormField().error;
            return (
              <FormItem className="gencl:sm:w-full gencl:mb-4 gencl:mt-2">
                <FormLabel className="is-required">Button URL</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter URL"
                    className={cn(
                      "gencl:border gencl:border-tertiary-200 gencl:bg-tertiary-100 gencl:text-title-3-med",
                      errors && "!gencl:border-red"
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage className={cn("")} />
              </FormItem>
            );
          }}
        />

        <FormField
          name="text"
          control={form.control}
          render={({ field }) => {
            const errors = useFormField().error;
            const currentLength = field.value?.length || 0;
            return (
              <FormItem className="gencl:sm:w-full gencl:mb-4 gencl:mt-2">
                <FormLabel className="gencl:flex gencl:justify-between">
                  <span className="is-required">Button text</span>
                  <span className="gencl:text-secondary-500 gencl:text-body-2-medium">
                    {currentLength}/{BUTTON_TEXT_LENGTH}
                  </span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter button text"
                    className={cn(
                      "gencl:border gencl:border-tertiary-200 gencl:bg-tertiary-100 gencl:text-title-3-med",
                      errors && "!gencl:border-red"
                    )}
                    {...field}
                  />
                </FormControl>
                <FormMessage className={cn("")} />
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
        <div className="gencl:flex gencl:justify-end gencl:gap-3">
          <Button size="sm" theme="custom" variant="default" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            size="sm"
            variant="default"
            type="submit"
            disabled={!isValid || !isDirty}
          >
            Save
          </Button>
        </div>
      </form>
    </Form>
  );
};
