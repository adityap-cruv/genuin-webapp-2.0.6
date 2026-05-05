import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";

import type { SVGIconsProps } from "../type";

const publishIconVariants = cva("gencl:stroke-black", {
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

type PublishIconProps = SVGIconsProps & VariantProps<typeof publishIconVariants>;

export function PublishIcon({ className, theme = "light", size, ...restProps }: PublishIconProps) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(publishIconVariants({ theme, size }), className)}
      {...restProps}>
      <path
        d="M11.1656 2.64043L3.80209 10.5577C3.35397 11.0395 3.6983 11.8201 4.35898 11.8201H7.93314V17.8924C7.93314 18.3079 8.27246 18.6446 8.69102 18.6446H14.754C15.1726 18.6446 15.5119 18.3079 15.5119 17.8924V11.8201H19.086C19.7468 11.8201 20.0911 11.0395 19.643 10.5577L12.2794 2.64043C11.9793 2.31777 11.4657 2.31777 11.1656 2.64043Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3.59961 21.6016H19.8458" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
