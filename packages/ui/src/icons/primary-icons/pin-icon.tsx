import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";

import type { SVGIconsProps } from "../type";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

const iconVariants = cva("", {
  variants: {
    theme: {
      dark: "gencl:fill-white",
      light: "gencl:fill-black",
      secondary: "gencl:fill-secondary-600",
    },
    size: defaultSizesForIcons(),
  },
  defaultVariants: {
    theme: "light",
    size: "md",
  },
});

// TODO: UPDATE this icon once the design is confirmed.
export function PinIcon({
  theme,
  size,
  className,
  ...restProps
}: SVGIconsProps & VariantProps<typeof iconVariants>) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(iconVariants({ theme, size }), className)}
      {...restProps}
    >
      <g clipPath="url(#clip0_5636_30482)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.4354 0.0157199C10.6884 -0.0187833 10.946 0.00367742 11.1892 0.0814609C11.4325 0.159245 11.6552 0.290385 11.8413 0.465302L11.8539 0.477569L15.5225 4.14614L15.5347 4.15879C15.7097 4.34485 15.8408 4.56762 15.9186 4.81086C15.9963 5.05408 16.0189 5.31162 15.9843 5.56464C15.9498 5.81767 15.8592 6.05978 15.7192 6.27331C15.5791 6.48683 15.3931 6.66637 15.1747 6.79879L15.1656 6.80433L12.2117 8.52115L11.0571 13.3571L11.0547 13.3672C11.0002 13.5787 10.892 13.7723 10.7406 13.9297C10.5893 14.0871 10.3999 14.2027 10.1907 14.2655C9.98161 14.3282 9.75983 14.336 9.54685 14.2879C9.33386 14.2398 9.1369 14.1375 8.97501 13.9911C8.96785 13.9846 8.96087 13.9779 8.95405 13.9711L1.92547 6.93107L1.91888 6.92447C1.76506 6.76527 1.65605 6.56822 1.60278 6.35334C1.54952 6.13847 1.55393 5.91334 1.6156 5.70072C1.67726 5.4881 1.79397 5.29554 1.95392 5.1425C2.11389 4.98946 2.31142 4.88137 2.52655 4.82918L2.53705 4.82663L7.43093 3.73678L9.20128 0.825302L9.20155 0.824841C9.33395 0.606738 9.51342 0.420835 9.72676 0.280887C9.94029 0.140818 10.1824 0.0502231 10.4354 0.0157199ZM0.251043 14.5375L3.87885 10.9096L5.09005 12.1227L1.46325 15.7497C1.12851 16.0845 0.585799 16.0845 0.251059 15.7497C-0.0836802 15.415 -0.0836874 14.8722 0.251043 14.5375Z"
        />
      </g>
    </svg>
  );
}
