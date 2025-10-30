import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";

import type { SVGIconsProps } from "../type";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

const iconVariants = cva("", {
  variants: {
    theme: {
      dark: "gencl:fill-white",
      light: "gencl:fill-black",
      secondary: "gencl:fill-secondary-600",
    },
    size: { ...defaultSizesForIcons(), default: "gencl:size-24" },
  },
  defaultVariants: {
    theme: "light",
    size: "default",
  },
});

export function IHeartTickIcon({
  theme,
  size,
  className,
  ...restProps
}: SVGIconsProps & VariantProps<typeof iconVariants>) {
  return (
    <svg
      width="96"
      height="96"
      viewBox="0 0 96 96"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(iconVariants({ theme, size }), className)}
      {...restProps}
    >
      <path
        d="M48 8C25.92 8 8 25.92 8 48C8 70.08 25.92 88 48 88C70.08 88 88 70.08 88 48C88 25.92 70.08 8 48 8ZM37.16 65.16L22.8 50.8C21.24 49.24 21.24 46.72 22.8 45.16C24.36 43.6 26.88 43.6 28.44 45.16L40 56.68L67.52 29.16C69.08 27.6 71.6 27.6 73.16 29.16C74.72 30.72 74.72 33.24 73.16 34.8L42.8 65.16C41.28 66.72 38.72 66.72 37.16 65.16Z"
        fill="url(#paint0_linear_8959_86138)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_8959_86138"
          x1="8"
          y1="8"
          x2="55.524"
          y2="104.066"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F6F8F9" />
          <stop offset="1" stopColor="#E6EAED" />
        </linearGradient>
      </defs>
    </svg>
  );
}
