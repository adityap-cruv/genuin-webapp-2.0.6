import { cva, VariantProps } from "class-variance-authority";

export const communityCardVariants = cva(
  "gencl:flex gencl:flex-col gencl:overflow-clip gencl:w-full gencl:h-full",
  {
    variants: {
      variant: {
        explore: "gencl:rounded-[10px] gencl:border gencl:border-secondary-150",
        search:
          "gencl:p-4 gencl:rounded-[10px] gencl:border gencl:border-secondary-150",
        suggestion:
          "gencl:p-3 gencl:rounded-lg gencl:hover:bg-secondary-50 gencl:cursor-pointer gencl:transition-colors",
        recent:
          "gencl:p-3 gencl:rounded-lg gencl:hover:bg-secondary-50 gencl:cursor-pointer gencl:transition-colors",
      },
    },
    defaultVariants: {
      variant: "explore",
    },
  }
);

export const communityCardHeaderVariants = cva("", {
  variants: {
    variant: {
      explore: "gencl:w-full gencl:h-15 gencl:bg-secondary-500",
      search: "gencl:flex gencl:items-center gencl:gap-2 gencl:w-full",
      suggestion: "gencl:flex gencl:gap-2 gencl:w-full",
      recent: "gencl:flex gencl:gap-2 gencl:w-full",
    },
  },
  defaultVariants: {
    variant: "explore",
  },
});

export type CommunityCardVariant = VariantProps<
  typeof communityCardVariants
>["variant"];
