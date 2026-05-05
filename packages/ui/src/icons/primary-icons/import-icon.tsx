import { cva } from "class-variance-authority";
import cn from "classnames";
import { type ComponentProps } from "react";

// Define the properties for the ImportIcon component
type Props = ComponentProps<"svg"> & {
  variant?: "default" | "active" | "light" | null; // Optional variant prop to determine the color scheme
};

// Define the class variance authority (cva) for the ImportIcon component
const Variant = cva("", {
  variants: {
    variant: {
      default: "gencl:stroke-black",
      light: "gencl:fill-white",
      active: "gencl:fill-black gencl:stroke-black",
    },
  },
});

export function ImportIcon({ variant = "default", className, ...props }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="22"
      height="22"
      viewBox="0 0 22 22"
      fill="none"
      {...props}
      className={cn(Variant({ variant }), className)}>
      <path
        d="M20.6004 7.80039V19.5337C20.6004 19.8166 20.4993 20.0879 20.3193 20.2879C20.1391 20.4881 19.895 20.6004 19.6404 20.6004H2.36039C2.10578 20.6004 1.86161 20.4881 1.68157 20.2879C1.50153 20.0879 1.40039 19.8166 1.40039 19.5337V2.46706C1.40039 2.18417 1.50153 1.91285 1.68157 1.71281C1.86161 1.51277 2.10578 1.40039 2.36039 1.40039H7.00039"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.2008 11.7998L11.0008 14.9998L7.80078 11.7998"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 14.8004V7.80039C11 4.26577 13.8654 1.40039 17.4 1.40039H20.6"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
