import { cva, type VariantProps } from "class-variance-authority";
import { type ComponentProps } from "react";

import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";

// Define the muteVariant function using cva to handle different styles based on props
const muteVariant = cva("", {
  variants: {
    theme: {
      dark: "gencl:fill-white", // Light variant style
      transparent: "gencl:fill-white", // Transparent variant style
      light: "gencl:fill-dark", // Dark variant style
    },
    size: defaultSizesForIcons(),
  },
  defaultVariants: {
    theme: "light", // Default to dark theme
    size: "md", // Default size
  },
});

// Define the Props type for the MuteIcon component
type Props = ComponentProps<"svg"> & VariantProps<typeof muteVariant>;

export function MuteIcon({ theme, size, className, ...restProps }: Props) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...restProps}
      className={cn(muteVariant({ theme, size }), className)}>
      <path d="M14.8396 7.08392C14.8738 7.04426 14.8933 6.9941 14.8949 6.94181V5.26016C14.9013 5.09719 14.8571 4.93622 14.7684 4.79938C14.6796 4.66255 14.5507 4.55656 14.3992 4.49598C14.2478 4.43541 14.0813 4.42322 13.9227 4.4611C13.764 4.49897 13.621 4.58506 13.5133 4.70751L8.87098 9.40507C8.8528 9.42467 8.83083 9.44037 8.8064 9.45123C8.78198 9.46209 8.7556 9.46787 8.72887 9.46823H6.99985C6.58107 9.46823 6.17944 9.63459 5.88332 9.93071C5.5872 10.2268 5.42084 10.6285 5.42084 11.0472V13.7395C5.42152 14.0777 5.53083 14.4069 5.73267 14.6783C5.9345 14.9498 6.21819 15.1493 6.54194 15.2474C6.57581 15.2601 6.6127 15.2623 6.64786 15.2539C6.68303 15.2454 6.71487 15.2267 6.73931 15.2L14.8396 7.08392Z" />
      <path d="M21.0135 4.5973C21.1605 4.44938 21.2431 4.24928 21.2431 4.0407C21.2431 3.83213 21.1605 3.63203 21.0135 3.4841C20.9401 3.4101 20.8528 3.35137 20.7566 3.31129C20.6603 3.2712 20.5572 3.25057 20.4529 3.25057C20.3487 3.25057 20.2455 3.2712 20.1493 3.31129C20.0531 3.35137 19.9658 3.4101 19.8924 3.4841L3.47861 19.9058C3.33156 20.0537 3.24902 20.2538 3.24902 20.4624C3.24902 20.6709 3.33156 20.8711 3.47861 21.019C3.51408 21.0553 3.55385 21.0871 3.59703 21.1137C3.74904 21.2171 3.93239 21.2643 4.11544 21.247C4.29848 21.2297 4.46976 21.149 4.5997 21.019L9.42358 16.1872C9.46266 16.1522 9.51326 16.1329 9.56569 16.1329C9.61813 16.1329 9.66872 16.1522 9.7078 16.1872L13.5132 20.0321C13.6236 20.1434 13.7647 20.2194 13.9185 20.2502C14.0722 20.2811 14.2317 20.2654 14.3765 20.2053C14.5214 20.1452 14.645 20.0433 14.7317 19.9126C14.8184 19.7819 14.8642 19.6284 14.8633 19.4715V10.787C14.8649 10.7347 14.8844 10.6845 14.9185 10.6449L21.0135 4.5973Z" />
    </svg>
  );
}
