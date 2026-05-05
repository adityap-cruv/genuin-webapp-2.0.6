import { cva, type VariantProps } from "class-variance-authority";

import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";

import type { SVGIconsProps } from "../type";

// Define the playVariant function using cva to handle different styles based on props
const deleteVariant = cva("", {
  variants: {
    theme: {
      light: "gencl:stroke-black",
      dark: "gencl:stroke-white",
      secondary: "gencl:stroke-secondary-600",
      "fill-dark": "gencl:fill-white",
      "fill-light": "gencl:fill-black",
    },
    size: defaultSizesForIcons(),
  },
  defaultVariants: {
    theme: "light",
    size: "md",
  },
});

type DeleteIconProps = SVGIconsProps & VariantProps<typeof deleteVariant>;

export function DeleteIcon({ theme = "light", size, className, ...restProps }: DeleteIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={cn(deleteVariant({ theme, size }), className)}
      {...restProps}>
      <path d="M3.59473 6H20.3947" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M14.1555 3.59961H9.83551C9.4536 3.59961 9.08733 3.71631 8.81727 3.92404C8.54722 4.13178 8.39551 4.41352 8.39551 4.7073V5.99961H15.5955V4.7073C15.5955 4.41352 15.4438 4.13178 15.1737 3.92404C14.9037 3.71631 14.5374 3.59961 14.1555 3.59961Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16.9878 19.3707C16.9652 19.6513 16.8409 19.9129 16.6395 20.1035C16.438 20.2942 16.1743 20.4 15.9006 20.4H8.09039C7.81666 20.4 7.55292 20.2942 7.35151 20.1035C7.1501 19.9129 7.02575 19.6513 7.00312 19.3707L5.99512 6H17.9951L16.9878 19.3707Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
