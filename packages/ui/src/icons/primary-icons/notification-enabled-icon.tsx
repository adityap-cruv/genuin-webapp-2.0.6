import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { SVGIconsProps } from "../type";

const variants = cva("gencl:w-5 gencl:h-5", {
  variants: {
    variant: {
      light: "gencl:stroke-black",
      dark: "gencl:stroke-white",
    },
  },
  defaultVariants: {
    variant: "light",
  },
});

export function NotificationEnabledIcon({
  className,
  variant = "light",
  ...props
}: SVGIconsProps & VariantProps<typeof variants>) {
  return (
    <svg
      width="25"
      height="24"
      viewBox="0 0 25 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={variants({ className, ...props })}
      {...props}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.6291 4C15.9848 4 18.7051 6.72029 18.7051 10.076C18.7051 11.9639 18.7051 13.8496 18.7051 15C18.7051 18 20.7305 19 20.7305 19L4.52782 19C4.52782 19 6.55316 18 6.55316 15C6.55316 13.8496 6.55316 11.9639 6.55316 10.076C6.55316 6.72029 9.27347 4 12.6291 4V4Z"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10.6056 18.5C10.6056 19.6046 11.5124 20.5 12.6309 20.5C13.7495 20.5 14.6562 19.6046 14.6562 18.5"
      />
      <path
        d="M10.6056 18.5C10.6056 19.6046 11.5124 20.5 12.6309 20.5C13.7495 20.5 14.6562 19.6046 14.6562 18.5"
        strokeWidth="1.5"
      />
      <path
        d="M3.51235 10C3.41749 8.6665 4.08266 5.4 7.50391 3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M17.5391 3.05762C17.5391 3.05762 18.5132 3.75365 19.046 4.29877C19.4343 4.6961 19.9574 5.39096 19.9574 5.39096C19.9574 5.39096 20.4744 6.13384 20.7364 6.64864C21.0115 7.1889 21.1576 7.50348 21.3165 8.08835C21.4489 8.5754 21.5025 8.85878 21.532 9.36258C21.5479 9.63355 21.532 10.0576 21.532 10.0576"
        strokeLinecap="round"
      />
      <circle cx="12.627" cy="2.5" r="1" />
    </svg>
  );
}
