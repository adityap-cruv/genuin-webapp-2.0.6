import { cn } from "src/lib/utils";

import type { SVGIconsProps } from "../type";

export function LockIcon({ className, ...restProps }: SVGIconsProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={cn(className)}
      {...restProps}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 3.75C14.3472 3.75 16.25 5.65279 16.25 8V10.25H7.75V8C7.75 5.65279 9.65279 3.75 12 3.75ZM6.25 10.25V8C6.25 4.82436 8.82436 2.25 12 2.25C15.1756 2.25 17.75 4.82436 17.75 8V10.25H18.5C19.1904 10.25 19.75 10.8096 19.75 11.5V20.5C19.75 21.1904 19.1904 21.75 18.5 21.75H5.5C4.80964 21.75 4.25 21.1904 4.25 20.5V11.5C4.25 10.8096 4.80964 10.25 5.5 10.25H6.25ZM7 11.75H5.75V20.25H18.25V11.75H17H7Z"
      />
    </svg>
  );
}
