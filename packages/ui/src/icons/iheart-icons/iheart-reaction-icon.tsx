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

export function IHeartReactionIcon({
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
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M14.3533 8.70016L15.3032 4.12016C15.4031 3.62016 15.2532 3.11016 14.8931 2.75016C14.3032 2.17016 13.3633 2.17016 12.7832 2.76016L7.25316 8.30016C6.88329 8.67017 6.67308 9.18016 6.67308 9.71017L6.67308 19.7002C6.67308 20.8002 7.57323 21.7002 8.67308 21.7002L17.6631 21.7002C18.4631 21.7002 19.1831 21.2202 19.4931 20.4902L22.7532 12.8802C23.6033 10.9002 22.1531 8.70016 20.0032 8.70016H14.3533ZM11.8959 10.7002L13.0007 5.37319L8.67328 9.70846L8.67308 9.71017L8.67308 19.7002L17.6558 19.7002L20.9154 12.0911C21.1996 11.4292 20.7147 10.7002 20.0032 10.7002L11.8959 10.7002Z"
      />
      <path d="M3 21.7002C4.10457 21.7002 5 20.8047 5 19.7002L5 11.7002C5 10.5956 4.10457 9.70016 3 9.70016C1.89543 9.70016 1 10.5956 1 11.7002L1 19.7002C1 20.8047 1.89543 21.7002 3 21.7002Z" />
    </svg>
  );
}
