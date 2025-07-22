import { cva, VariantProps } from "class-variance-authority";

export const genericDetailsVariants = cva("gencl:space-y-3", {
  variants: {
    variant: {
      default: "",
      list: "",
      community: "",
      profile: "",
    },
  },
});

export type GenericDetailsVariants = VariantProps<
  typeof genericDetailsVariants
>;
