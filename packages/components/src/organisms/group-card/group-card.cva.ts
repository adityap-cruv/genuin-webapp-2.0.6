import { cva, VariantProps } from "class-variance-authority";

export const groupCardVariants = cva("gencl:cursor-pointer", {
  variants: {
    variant: {
      explore:
        "gencl:border gencl:rounded-lg gencl:border-secondary-150 gencl:p-4 gencl:space-y-4",
      search:
        "gencl:border gencl:rounded-lg gencl:border-secondary-150 gencl:p-4 gencl:flex gencl:items-center gencl:gap-3 gencl:w-full",
      suggestion:
        "gencl:p-3 gencl:flex gencl:items-start gencl:gap-3 gencl:w-full gencl:hover:bg-secondary-50 gencl:transition-colors gencl:cursor-pointer",
      recent:
        "gencl:p-3 gencl:flex gencl:items-start gencl:gap-3 gencl:w-full gencl:hover:bg-secondary-50 gencl:transition-colors gencl:cursor-pointer",
    },
  },
  defaultVariants: {
    variant: "explore",
  },
});

export const groupCardContentVariants = cva("", {
  variants: {
    variant: {
      explore: "gencl:space-y-4",
      search:
        "gencl:flex gencl:justify-between gencl:items-start gencl:gap-2 gencl:w-full",
      suggestion:
        "gencl:flex gencl:justify-between gencl:items-start gencl:gap-2 gencl:w-full",
      recent:
        "gencl:flex gencl:justify-between gencl:items-start gencl:gap-2 gencl:w-full",
    },
  },
  defaultVariants: {
    variant: "explore",
  },
});

export type GroupCardVariant = VariantProps<
  typeof groupCardVariants
>["variant"];
