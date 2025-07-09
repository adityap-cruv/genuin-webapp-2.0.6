import { cva } from "class-variance-authority";

// Common styles for interactive variants
const INTERACTIVE_STYLES =
  "gencl:cursor-pointer gencl:hover:bg-secondary-50 gencl:rounded-md gencl:transition-colors";

export const memberItemVariants = cva(
  "gencl:flex gencl:gap-2 gencl:overflow-hidden",
  {
    variants: {
      variant: {
        default: `gencl:p-3 ${INTERACTIVE_STYLES}`,
        suggestion: `gencl:p-3 ${INTERACTIVE_STYLES}`,
        recent: `gencl:w-full gencl:min-w-0 ${INTERACTIVE_STYLES}`,
        profile: "gencl:flex-col gencl:items-center gencl:w-fit gencl:gap-0",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export const memberItemUsernameVariants = cva("", {
  variants: {
    variant: {
      default: "gencl:text-body-1-medium gencl:text-secondary-600",
      suggestion: "gencl:text-body-1-semi-bold gencl:text-secondary-900",
      recent: "gencl:text-body-1-semi-bold gencl:text-secondary-900",
      profile: "gencl:text-body-2-medium gencl:text-secondary-900",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const memberItemNameVariants = cva("gencl:line-clamp-1", {
  variants: {
    variant: {
      default: "gencl:text-body-1-semi-bold",
      suggestion: "gencl:text-body-2-medium",
      recent: "gencl:text-body-1-medium",
      profile: "gencl:text-body-2-medium",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export const memberItemBioVariants = cva(
  "gencl:text-body-2-medium gencl:text-secondary-600 gencl:line-clamp-1",
  {
    variants: {
      variant: {
        default: "",
        suggestion: "",
        recent: "",
        profile: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export const memberItemAvatarVariants = cva("", {
  variants: {
    variant: {
      default: "",
      suggestion: "",
      recent: "",
      profile: "gencl:size-20",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

export type MemberItemVariant = "default" | "suggestion" | "recent" | "profile";
