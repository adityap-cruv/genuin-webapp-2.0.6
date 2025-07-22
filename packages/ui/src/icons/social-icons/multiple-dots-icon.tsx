import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";
import type { SVGIconsProps } from "../type";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

const iconVariant = cva("", {
  variants: {
    theme: {
      dark: "gencl:fill-white",
      light: "gencl:fill-black",
      primary: "gencl:fill-primary-600",
    },
    size: defaultSizesForIcons(),
  },
  defaultVariants: {
    theme: "dark",
    size: "md",
  },
});

export function MultipleDotsIcon({
  theme,
  size,
  className,
  ...restProps
}: SVGIconsProps & VariantProps<typeof iconVariant>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="14"
      viewBox="0 0 12 14"
      className={cn(className, iconVariant({ theme, size }))}
      {...restProps}
    >
      <circle cx="2.17898" cy="1.27273" r="1.27273" />
      <circle cx="2.17898" cy="5.09109" r="1.27273" />
      <circle cx="2.17898" cy="8.90945" r="1.27273" />
      <circle cx="5.99929" cy="1.27273" r="1.27273" />
      <circle cx="5.99929" cy="5.09109" r="1.27273" />
      <circle cx="5.99929" cy="8.90945" r="1.27273" />
      <circle cx="5.99929" cy="12.7278" r="1.27273" />
      <circle cx="9.81179" cy="1.27273" r="1.27273" />
      <circle cx="9.81179" cy="5.09109" r="1.27273" />
      <circle cx="9.81179" cy="8.90945" r="1.27273" />
    </svg>
  );
}
