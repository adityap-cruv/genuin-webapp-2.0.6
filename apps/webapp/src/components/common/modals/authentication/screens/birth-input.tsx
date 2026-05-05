import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useShallow } from "zustand/react/shallow";

import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormControl } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/ui/loader";
import { cn } from "@/lib/utils";

import { updateUser } from "../api/auth";
import "../css/date-picker.css";
import { ModalShell } from "../modal-shell";
import { useAuthenticationModalStore } from "../store";

import { type ScreenProps } from ".";

const formSchema = z.object({
  birth: z.string().min(1, "Please enter your birthdate"),
});

const minDate = new Date();
minDate.setFullYear(new Date().getFullYear() - 100);

const maxDate = new Date();
maxDate.setFullYear(new Date().getFullYear() - 18);

const suggestionDate = new Date();
suggestionDate.setFullYear(new Date().getFullYear() - 23);
suggestionDate.setMonth(0);
suggestionDate.setDate(1);

function getCurrentDate(str: string) {
  const [day, month, year] = str.split("/").map((value) => Number(value));
  let date;
  if (year && month && day) date = new Date(Date.UTC(year, month - 1, day));
  if (date) return date.toISOString().split("T")[0];
}

export function BirthInput({ onNext }: ScreenProps) {
  const { formData } = useAuthenticationModalStore(useShallow((state) => ({ formData: state.formData })));

  const [isLoading, setIsLoading] = useState(false);
  const { data: sessionData, update: updateSession } = useSession();
  const form = useForm<{ birth: string }>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      birth: formData.birth ? (getCurrentDate(formData.birth) ?? "") : suggestionDate.toISOString().split("T")[0],
    },
    criteriaMode: "firstError",
    mode: "onBlur",
  });
  const { isValid, isDirty } = form.formState;

  async function onSubmit({ birth }: { birth: string }) {
    setIsLoading(true);
    const date = new Date(birth);
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Months are 0-based in JavaScript
    const year = date.getFullYear();
    const formattedDate = `${day}/${month}/${year}`;
    // console.log('ans;:', new Date(birth).toLocaleDateString())
    if (date > new Date()) {
      form.setError("birth", { message: "Please enter a valid date." });
      return;
    }

    try {
      const response = await updateUser({ birthday: formattedDate });
      if (response.status) {
        await updateSession({ ...sessionData, user: { ...sessionData?.user, birth: formattedDate } }).then((_) => {
          onNext();
        });
      }
    } catch (e) {
      form.setError("root", { message: "Something went wrong. Please try again!" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ModalShell>
      <p className="text-title-1-demi sm:text-heading-3 text-center">Birthdate</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
          <FormField
            control={form.control}
            name="birth"
            render={({ field, fieldState }) => {
              return (
                <FormItem className="sm:w-full">
                  <FormControl>
                    <Input
                      max={maxDate.toISOString().split("T")[0]}
                      min={minDate.toISOString().split("T")[0]}
                      type="date"
                      className={cn(
                        "border-tertiary-200 bg-tertiary-100 text-title-3-med w-full border",
                        fieldState.error && "!border-red"
                      )}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              );
            }}
          />
          <Button type="submit" variant="default" className="w-full" disabled={!isValid || isLoading || !isDirty}>
            {isLoading ? (
              <Loader className="fill-monochrome-white stroke-monochrome-white" size="sm" />
            ) : (
              <p className="text-title-3-demi">Save</p>
            )}
          </Button>
        </form>
      </Form>
      {form.formState.errors.root && (
        <p className="text-text-new-para-2-mobile text-supplementary-red flex items-center justify-center text-center">
          {form.formState.errors.root.message}
        </p>
      )}
    </ModalShell>
  );
}
