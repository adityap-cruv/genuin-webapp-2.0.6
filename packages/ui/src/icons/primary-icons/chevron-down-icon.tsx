import type { SVGIconsProps } from "../type";

export function ChevronDownIcon({ className, ...restProps }: SVGIconsProps) {
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
        d="M6.00044 7.70474L0.000976562 1.70528L1.41085 0.29541L6.00044 4.87499L10.59 0.29541L11.9999 1.70528L6.00044 7.70474Z"
        fill="#767B81"
      />
    </svg>
  );
}
