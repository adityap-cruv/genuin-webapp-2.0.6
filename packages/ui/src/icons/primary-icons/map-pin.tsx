import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";

import type { SVGIconsProps } from "../type";

// Define the mapPinVariant function using cva to handle different styles based on props
const mapPinVariant = cva("", {
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

// Define the Props type for the MapPinIcon component
type MapPinIconPropsType = SVGIconsProps & VariantProps<typeof mapPinVariant>;

export function MapPinIcon({ theme = "dark", size, className, ...restProps }: MapPinIconPropsType) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      className={cn(mapPinVariant({ theme, size }), className)}
      {...restProps}>
      <path
        d="M12.849 20.2688C12.6958 20.3781 12.5123 20.4369 12.324 20.4369C12.1358 20.4369 11.9522 20.3781 11.799 20.2688C7.27183 17.0419 2.46714 10.4044 7.32433 5.60813C8.65732 4.29574 10.4534 3.56087 12.324 3.5625C14.199 3.5625 15.9981 4.29844 17.3237 5.60719C22.1809 10.4034 17.3762 17.04 12.849 20.2688Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.3242 12C12.8215 12 13.2984 11.8025 13.65 11.4508C14.0017 11.0992 14.1992 10.6223 14.1992 10.125C14.1992 9.62772 14.0017 9.15081 13.65 8.79917C13.2984 8.44754 12.8215 8.25 12.3242 8.25C11.8269 8.25 11.35 8.44754 10.9984 8.79917C10.6468 9.15081 10.4492 9.62772 10.4492 10.125C10.4492 10.6223 10.6468 11.0992 10.9984 11.4508C11.35 11.8025 11.8269 12 12.3242 12Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
