import { type ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";

// Define the notificationVariant function using cva to handle different styles based on props
const notificationVariant = cva("", {
  variants: {
    theme: {
      light: "gencl:stroke-black", // Light variant style
      dark: "gencl:stroke-white", // Dark variant style
    },
    size: defaultSizesForIcons(),
  },
  defaultVariants: {
    theme: "light", // Default to light theme
    size: "md", // Default size
  },
});

type NotificationIconPropsType = ComponentProps<"svg"> &
  VariantProps<typeof notificationVariant>;

export function NotificationIcon({
  theme,
  size,
  className,
  ...restProps
}: NotificationIconPropsType) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...restProps}
      className={cn(notificationVariant({ theme, size }), className)}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.1331 4C15.4887 4 18.209 6.72029 18.209 10.076C18.209 11.9639 18.209 13.8496 18.209 15C18.209 18 20.2344 19 20.2344 19L4.03173 19C4.03173 19 6.05706 18 6.05706 15C6.05706 13.8496 6.05706 11.9639 6.05706 10.076C6.05706 6.72029 8.77738 4 12.1331 4V4Z"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.1056 18.5C10.1056 19.6046 11.0124 20.5 12.1309 20.5C13.2495 20.5 14.1562 19.6046 14.1562 18.5"
      />
      <path
        d="M10.1056 18.5C10.1056 19.6046 11.0124 20.5 12.1309 20.5C13.2495 20.5 14.1562 19.6046 14.1562 18.5"
        strokeWidth="1.5"
      />
      <circle cx="12.125" cy="2.5" r="1" />
    </svg>
  );
}
