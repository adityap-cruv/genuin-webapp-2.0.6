import { cn } from "@genuin/ui/lib/utils";
import type { SVGIconsProps } from "../type";

export function GoogleIcon({ className, ...restProps }: SVGIconsProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={cn("gencl:fill-black", className)}
      {...restProps}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20.208 12.1942C20.208 11.5879 20.1536 11.0049 20.0525 10.4453H12V13.7526H16.6015C16.4032 14.8214 15.8009 15.7269 14.8953 16.3332V18.4784H17.6585C19.2753 16.9899 20.208 14.798 20.208 12.1942Z"
        fill="#4285F4"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 20.5505C14.3085 20.5505 16.2439 19.7849 17.6585 18.4791L14.8953 16.3338C14.1297 16.8468 13.1503 17.1499 12 17.1499C9.77308 17.1499 7.88819 15.6459 7.21585 13.625H4.35938V15.8402C5.76624 18.6345 8.65769 20.5505 12 20.5505Z"
        fill="#34A853"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M7.21901 13.6244C7.04801 13.1114 6.95085 12.5634 6.95085 11.9999C6.95085 11.4364 7.04801 10.8884 7.21901 10.3754V8.16016H4.36253C3.78347 9.31441 3.45312 10.6202 3.45312 11.9999C3.45312 13.3795 3.78347 14.6854 4.36253 15.8396L7.21901 13.6244Z"
        fill="#FBBC05"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 6.84979C13.2553 6.84979 14.3823 7.28117 15.2684 8.1284L17.7207 5.67611C16.24 4.29645 14.3046 3.44922 12 3.44922C8.65769 3.44922 5.76624 5.3652 4.35938 8.15949L7.21585 10.3747C7.88819 8.35381 9.77308 6.84979 12 6.84979Z"
        fill="#EA4335"
      />
    </svg>
  );
}
