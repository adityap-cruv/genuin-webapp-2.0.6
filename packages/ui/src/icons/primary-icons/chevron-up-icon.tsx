import { SVGIconsProps } from "../type";
import React from "react";
export function ChevronUpIcon({ className, ...restProps }: SVGIconsProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="8"
      viewBox="0 0 12 8"
      fill="none"
      className={className}
      {...restProps}
    >
      <path
        d="M6.00044 0.29541L0.000976562 6.29487L1.41085 7.70474L6.00044 3.12516L10.59 7.70474L11.9999 6.29487L6.00044 0.29541Z"
        fill="#767B81"
      />
    </svg>
  );
}
