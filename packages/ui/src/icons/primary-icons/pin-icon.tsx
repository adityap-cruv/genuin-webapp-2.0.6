import { cn } from "src/lib/utils";

import type { SVGIconsProps } from "../type";

// TODO: UPDATE this icon once the design is confirmed.
export function PinIcon({ className, ...restProps }: SVGIconsProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="19"
      height="19"
      viewBox="0 0 19 19"
      className={cn("gencl:fill-black", className)}
      {...restProps}
    >
      <path
        d="M13.2275 1.29492C13.2579 1.30462 13.2872 1.31794 13.3145 1.33398L13.3896 1.39062L17.6152 5.61719C17.6347 5.63872 17.6524 5.66168 17.667 5.68652L17.7051 5.77246V5.77344C17.7147 5.8037 17.7219 5.8347 17.7246 5.86621L17.7217 5.96094C17.7174 5.99225 17.7103 6.02319 17.6992 6.05273L17.6562 6.13672C17.6218 6.18926 17.575 6.23278 17.5215 6.26562L13.8594 8.39551C13.6731 8.5038 13.5324 8.67453 13.4619 8.87598L13.4365 8.96484L12.0713 14.6816L4.19824 6.7959L9.95703 5.51465C10.1661 5.46799 10.3504 5.34803 10.4785 5.17871L10.5303 5.10352L12.7324 1.48145L12.7334 1.48047C12.7499 1.4533 12.7691 1.428 12.791 1.40527L12.8633 1.34473C12.8899 1.32727 12.9186 1.31283 12.9482 1.30176L13.04 1.2793C13.0715 1.27501 13.1034 1.27364 13.1348 1.27637L13.2275 1.29492Z"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M1.375 17.6235L7.5588 11.4395"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
