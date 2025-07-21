import { ComponentProps, useCallback, useMemo } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
} from "@genuin/ui/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@genuin/ui/components";
import { useUpdateUserMutation } from "@genuin/components/react-query/api/authentication";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthContext } from "@genuin/components/context/auth";
import { cn } from "@genuin/ui/lib/utils";
import { Toast } from "@genuin/ui/components";
import { useAuthenticationModalContext } from "../../context";
import { SubmitButton } from "../../submit-button";

const MONTHS = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month, 0).getDate();
};

const formSchema = z.object({
  month: z.string(),
  day: z.string(),
  year: z.string(),
});

export function EditBirthDate({
  className,
  ...restProps
}: ComponentProps<"div">) {
  const { user, updateUser } = useAuthContext();
  const { closeModal } = useAuthenticationModalContext();

  function parseBirthday() {
    if (user?.birth && typeof user.birth === "string") {
      const [day, month, year] = user.birth.split("/");
      if (day && month && year) {
        // Remove leading zeros
        return {
          day: String(Number(day)),
          month: String(Number(month)),
          year: String(Number(year)),
        };
      }
    }
  }

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;
  const currentDay = today.getDate();
  const minYear = 1940;
  const maxYear = currentYear - 13;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
    defaultValues: {
      month: parseBirthday()?.month ?? "",
      day: parseBirthday()?.day ?? "",
      year: parseBirthday()?.year ?? "",
    },
  });

  const selectedYear = Number(form.watch("year"));
  const selectedMonth = Number(form.watch("month"));

  const yearOptions = useMemo(() => {
    const years = [];
    for (let y = maxYear; y >= minYear; y--) {
      years.push(y);
    }
    return years;
  }, [maxYear, minYear]);

  const monthOptions = useMemo(() => {
    if (!selectedYear) return MONTHS;
    if (selectedYear === maxYear) {
      return MONTHS.filter((m) => Number(m.value) <= currentMonth);
    }
    return MONTHS;
  }, [selectedYear, maxYear, currentMonth]);

  const dayOptions = useMemo(() => {
    if (!selectedMonth) return [];
    // Use selectedYear if available, otherwise minYear (1940)
    const yearForDays = selectedYear || minYear;
    let daysInMonth = getDaysInMonth(yearForDays, selectedMonth);
    let maxDay = daysInMonth;
    if (selectedYear === maxYear && selectedMonth === currentMonth) {
      maxDay = currentDay;
    }
    return Array.from({ length: maxDay }, (_, i) => i + 1);
  }, [selectedYear, selectedMonth, maxYear, currentMonth, currentDay, minYear]);

  const isAtLeast13 = (year: number, month: number, day: number) => {
    if (!year || !month || !day) return true;
    const selected = new Date(year, month - 1, day);
    const minAllowed = new Date(currentYear - 13, currentMonth - 1, currentDay);
    return selected <= minAllowed;
  };

  const { mutate: updateUserDetails, isPending: isPendingUpdateUser } =
    useUpdateUserMutation({
      onSuccess: ({ status }) => {
        if (status) {
          const { day, month, year } = form.getValues();
          updateUser({ ...user, birth: `${day}/${month}/${year}` });
          Toast.Success({
            message: "Your birth date has been updated",
          });
          closeModal();
        }
      },
      onError: () => {
        form.setError("root", {
          message:
            "Something went wrong while updating birth date. Please try again!",
        });
      },
    });

  const onSubmit = useCallback(
    (data: z.infer<typeof formSchema>) => {
      form.control.setError("root", { message: undefined });
      const year = Number(data.year);
      const month = Number(data.month);
      const day = Number(data.day);

      if (!isAtLeast13(year, month, day)) {
        form.control.setError("root", {
          message: "You must be at least 13 years old.",
        });
        return;
      }
      updateUserDetails({ birthday: `${day}/${month}/${year}` });
    },
    [currentYear, currentMonth, currentDay]
  );

  return (
    <div className={cn("gencl:space-y-6", className)} {...restProps}>
      <div className="gencl:space-y-2">
        <h3 className="gencl:text-center gencl:text-headline-2-semi-bold">
          Edit Birth date
        </h3>
        <p className="gencl:text-center gencl:text-body-1-medium gencl:text-secondary-600">
          Update your birth date
        </p>
      </div>
      <p className="gencl:text-body-1-medium gencl:mb-2">Birth date</p>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="gencl:space-y-6 gencl:grid gencl:grid-cols-3 gencl:gap-2">
            <FormField
              control={form.control}
              name="month"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="MM" />
                      </SelectTrigger>
                      <SelectContent className="gencl:w-full">
                        {monthOptions.map((m) => (
                          <SelectItem
                            key={m.value}
                            value={m.value}
                            showTickMark={false}
                          >
                            {m.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="day"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="DD" />
                      </SelectTrigger>
                      <SelectContent>
                        {dayOptions.map((d) => (
                          <SelectItem
                            key={d.toString()}
                            value={d.toString()}
                            showTickMark={false}
                          >
                            {d}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="YYYY" />
                      </SelectTrigger>
                      <SelectContent>
                        {yearOptions.map((y) => (
                          <SelectItem
                            key={y}
                            value={y.toString()}
                            showTickMark={false}
                          >
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
          <div className="gencl:col-span-3">
            <SubmitButton
              title="Save"
              disabled={
                !form.formState.isValid ||
                !form.formState.isDirty ||
                Object.values(form.watch()).some((i) => i === "") ||
                isPendingUpdateUser
              }
              isLoading={isPendingUpdateUser}
              error={form.formState.errors.root?.message ?? ""}
              className="gencl:col-span-3 gencl:w-full"
            />
          </div>
        </form>
      </Form>
    </div>
  );
}
