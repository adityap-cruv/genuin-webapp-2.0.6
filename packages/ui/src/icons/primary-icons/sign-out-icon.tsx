import type { SVGIconsProps } from "../type";

export function SignOutIcon({ ...restProps }: SVGIconsProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      {...restProps}
    >
      <path
        d="M8 21H4.66667C4.22464 21 3.80072 20.7893 3.48816 20.4142C3.17559 20.0391 3 19.5304 3 19V5C3 4.46957 3.17559 3.96086 3.48816 3.58579C3.80072 3.21071 4.22464 3 4.66667 3H8"
        stroke="#1D1F20"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 17L21 12L16 7"
        stroke="#1D1F20"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 12H9"
        stroke="#1D1F20"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
