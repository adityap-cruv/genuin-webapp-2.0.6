import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";

import type { SVGIconsProps } from "../type";

const iconVariants = cva("", {
  variants: {
    theme: {
      dark: "gencl:fill-white",
      light: "gencl:fill-black",
      secondary: "gencl:fill-secondary-600",
    },
    size: defaultSizesForIcons(),
  },
  defaultVariants: {
    theme: "light",
    size: "md",
  },
});

export function IHeartMuteIcon({
  theme,
  size,
  className,
  ...restProps
}: SVGIconsProps & VariantProps<typeof iconVariants>) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(iconVariants({ theme, size }), className)}
      {...restProps}>
      <path d="M3.62988 5.04039C3.23999 4.65039 3.23999 4.0204 3.62988 3.6304C4.03003 3.24039 4.65991 3.24039 5.05005 3.6304L20.3601 18.9504C20.75 19.3404 20.75 19.9704 20.3601 20.3604C19.97 20.7504 19.3401 20.7504 18.95 20.3604L17.6101 19.0204C16.9399 19.5604 16.1899 20.0004 15.3899 20.3304C14.73 20.6004 14 20.1404 14 19.4204C14 19.0304 14.22 18.6504 14.5801 18.5004C15.1599 18.2704 15.6899 17.9604 16.1799 17.5904L12 13.4104V17.5804C12 18.4704 10.9199 18.9204 10.29 18.2904L7 15.0004H4C3.44995 15.0004 3 14.5504 3 14.0004V10.0004C3 9.4504 3.44995 9.00039 4 9.00039H7L7.29004 8.7004L3.62988 5.04039Z" />
      <path d="M18.5901 14.3404C18.8501 13.6104 19 12.8204 19 12.0004C19 9.06039 17.1799 6.54039 14.6101 5.50039C14.25 5.36039 14 5.03039 14 4.65039V4.46039C14 3.83039 14.6299 3.37039 15.22 3.60039C18.6001 4.89039 21 8.17039 21 12.0004C21 13.3904 20.6799 14.7004 20.1201 15.8704L18.5901 14.3404Z" />
      <path d="M10.29 5.71039L10.1201 5.88039L12 7.76039V6.41039C12 5.52039 10.9202 5.08039 10.29 5.71039Z" />
      <path d="M14 7.97039C15.48 8.71039 16.5 10.2304 16.5 12.0004C16.5 12.0449 16.4968 12.0893 16.4924 12.1338C16.4888 12.1693 16.4844 12.2049 16.48 12.2404L14 9.76039V7.97039Z" />
    </svg>
  );
}
