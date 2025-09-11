import { type ComponentProps } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@genuin/ui/lib/utils";

// Define the playVariant function using cva to handle different styles based on props
const playVariant = cva("", {
  variants: {
    variant: {
      dark: "gencl:fill-secondary-500", // Light variant style
      transparent: "gencl:fill-white", // Transparent variant style
      light: "gencl:fill-white", // Dark variant style
    },
  },
});

// Define the Props type for the ImageIcon component
type ImageIconPropsType = ComponentProps<"svg"> &
  VariantProps<typeof playVariant> & {
    variant?: "light" | "transparent" | "dark" | null;
  };

export function ImageIcon({
  variant = "dark",
  className,
  ...restProps
}: ImageIconPropsType) {
  return (
    <svg
      className={cn(playVariant({ variant }), className)}
      xmlns="http://www.w3.org/2000/svg"
      width="33"
      height="33"
      viewBox="0 0 33 33"
      fill="none"
      {...restProps}
    >
      <g clip-path="url(#clip0_1621_234394)">
        <path d="M19.3252 14.501C19.9185 14.501 20.4986 14.325 20.9919 13.9954C21.4853 13.6657 21.8698 13.1972 22.0968 12.649C22.3239 12.1009 22.3833 11.4977 22.2676 10.9157C22.1518 10.3338 21.8661 9.79921 21.4465 9.37966C21.027 8.9601 20.4924 8.67438 19.9105 8.55862C19.3285 8.44287 18.7253 8.50228 18.1771 8.72934C17.629 8.9564 17.1604 9.34092 16.8308 9.83427C16.5011 10.3276 16.3252 10.9076 16.3252 11.501C16.3252 12.2966 16.6413 13.0597 17.2039 13.6223C17.7665 14.1849 18.5295 14.501 19.3252 14.501ZM19.3252 10.501C19.523 10.501 19.7163 10.5596 19.8808 10.6695C20.0452 10.7794 20.1734 10.9356 20.2491 11.1183C20.3248 11.301 20.3446 11.5021 20.306 11.6961C20.2674 11.89 20.1722 12.0682 20.0323 12.2081C19.8925 12.3479 19.7143 12.4432 19.5203 12.4818C19.3263 12.5203 19.1252 12.5005 18.9425 12.4249C18.7598 12.3492 18.6036 12.221 18.4937 12.0565C18.3838 11.8921 18.3252 11.6988 18.3252 11.501C18.3252 11.2358 18.4306 10.9814 18.6181 10.7939C18.8056 10.6063 19.06 10.501 19.3252 10.501Z" />
        <path d="M26.3252 4.50098H6.3252C5.79476 4.50098 5.28605 4.71169 4.91098 5.08676C4.53591 5.46184 4.3252 5.97054 4.3252 6.50098V26.501C4.3252 27.0314 4.53591 27.5401 4.91098 27.9152C5.28605 28.2903 5.79476 28.501 6.3252 28.501H26.3252C26.8556 28.501 27.3643 28.2903 27.7394 27.9152C28.1145 27.5401 28.3252 27.0314 28.3252 26.501V6.50098C28.3252 5.97054 28.1145 5.46184 27.7394 5.08676C27.3643 4.71169 26.8556 4.50098 26.3252 4.50098ZM26.3252 26.501H6.3252V20.501L11.3252 15.501L16.9152 21.091C17.2899 21.4635 17.7968 21.6726 18.3252 21.6726C18.8536 21.6726 19.3605 21.4635 19.7352 21.091L21.3252 19.501L26.3252 24.501V26.501ZM26.3252 21.671L22.7352 18.081C22.3605 17.7085 21.8536 17.4994 21.3252 17.4994C20.7968 17.4994 20.2899 17.7085 19.9152 18.081L18.3252 19.671L12.7352 14.081C12.3605 13.7085 11.8536 13.4994 11.3252 13.4994C10.7968 13.4994 10.2899 13.7085 9.9152 14.081L6.3252 17.671V6.50098H26.3252V21.671Z" />
      </g>
      <defs>
        <clipPath id="clip0_1621_234394">
          <rect
            width="32"
            height="32"
            fill="white"
            transform="translate(0.325195 0.500977)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}
