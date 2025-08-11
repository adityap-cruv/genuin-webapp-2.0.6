import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { SVGIconsProps } from "../type";
import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";

const iconVariants = cva("gencl:shrink-0", {
  variants: {
    theme: {
      light: "gencl:stroke-black",
      dark: "gencl:stroke-white",
    },
    size: defaultSizesForIcons(),
  },
  defaultVariants: {
    theme: "light",
    size: "md",
  },
});

type Props = SVGIconsProps & VariantProps<typeof iconVariants>;
export function LoginIcon({ className, theme, size, ...restProps }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={cn(iconVariants({ theme, size }), className)}
      {...restProps}
    >
      <path
        d="M16 3H19.3333C19.7754 3 20.1993 3.21071 20.5118 3.58579C20.8244 3.96086 21 4.46957 21 5V19C21 19.5304 20.8244 20.0391 20.5118 20.4142C20.1993 20.7893 19.7754 21 19.3333 21H16"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 17L15 12L10 7"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15 12H3"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
