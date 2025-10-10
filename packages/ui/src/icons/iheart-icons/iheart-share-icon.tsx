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
    size: defaultSizesForIcons(),
  },
  defaultVariants: {
    theme: "light",
    size: "md",
  },
});

export function IHeartShareIcon({
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
      {...restProps}
    >
      <path d="M12.3347 1.16329C12.1343 0.94387 11.7798 0.94587 11.5818 1.16755L8.25146 4.89828C7.8772 5.31758 7.92627 5.95002 8.36133 6.31087C8.79614 6.67172 9.45215 6.62435 9.8264 6.20504L11 4.89046V14.4363C11 14.9706 11.4478 15.4038 12 15.4038C12.5522 15.4038 13 14.9706 13 14.4363V4.92124L14.1814 6.21388C14.5608 6.62893 15.2173 6.66891 15.6479 6.30318C16.0784 5.93745 16.1199 5.3045 15.7405 4.88945L12.3347 1.16329Z" />
      <path d="M4 9.52218C4 8.52425 4.84082 7.72981 5.86035 7.72981H8C8.55225 7.72981 9 8.16295 9 8.69726C9 9.23157 8.55225 9.66471 8 9.66471H6V21.0651H18V9.66471H16C15.4478 9.66471 15 9.23157 15 8.69726C15 8.16295 15.4478 7.72981 16 7.72981H18.1401C19.1594 7.72981 20 8.5246 20 9.52218V21.2081C20 22.2056 19.1592 23 18.1401 23H5.86035C4.84131 23 4 22.2059 4 21.2081V9.52218Z" />
    </svg>
  );
}
