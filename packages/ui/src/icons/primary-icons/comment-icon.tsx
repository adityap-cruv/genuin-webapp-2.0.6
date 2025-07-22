import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";
import type { SVGIconsProps } from "../type";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

const repostIconVariants = cva("", {
  variants: {
    theme: {
      light: "gencl:stroke-black",
      dark: "gencl:stroke-white",
      secondary: "gencl:stroke-secondary-600",
    },
    size: defaultSizesForIcons(),
  },
  defaultVariants: {
    theme: "light",
  },
});

type CommentIconProps = SVGIconsProps & VariantProps<typeof repostIconVariants>;

export function CommentIcon({
  className,
  theme,
  size,
  ...restProps
}: CommentIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="32"
      height="33"
      viewBox="0 0 32 33"
      fill="none"
      className={cn(className, repostIconVariants({ theme, size }))}
      {...restProps}
    >
      <path
        d="M16 4.5625C9.392 4.5625 4 9.34364 4 15.2215C4.016 16.6439 4.32 18.0319 4.896 19.3001C5.472 20.5682 6.288 21.6992 7.312 22.5903L4.912 27.7484C4.864 27.8513 4.848 27.9712 4.864 28.0912C4.88 28.2111 4.928 28.314 5.008 28.3996C5.088 28.4853 5.184 28.5367 5.296 28.5539C5.408 28.571 5.52 28.5539 5.616 28.5025L12.032 25.2808C13.328 25.692 14.656 25.8977 16 25.8805C22.608 25.8805 28 21.0994 28 15.2044C28 9.30936 22.608 4.5625 16 4.5625Z"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
