import { cva, type VariantProps } from "class-variance-authority";
import { type ComponentProps } from "react";
import React from "react";

import { cn } from "@genuin/ui/lib/utils";

// Define the muteVariant function using cva to handle different styles based on props
const muteVariant = cva("", {
  variants: {
    variant: {
      dark: "gencl:fill-black", // Light variant style
      transparent: "gencl:fill-white", // Transparent variant style
      light: "gencl:fill-white", // Dark variant style
    },
  },
});

// Define the Props type for the MuteIcon component
type Props = ComponentProps<"svg"> &
  VariantProps<typeof muteVariant> & {
    variant?: "light" | "transparent" | "dark" | null;
  };

export function MuteIcon({ variant = "dark", className, ...restProps }: Props) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...restProps}
      className={cn(className)}
    >
      <path
        d="M15.4886 5.79227C15.5312 5.74269 15.5556 5.68 15.5577 5.61463V3.51253C15.5657 3.3088 15.5105 3.10759 15.3995 2.93654C15.2886 2.76549 15.1274 2.633 14.9381 2.55728C14.7488 2.48156 14.5407 2.46633 14.3424 2.51367C14.1441 2.56102 13.9653 2.66862 13.8306 2.82169L8.02761 8.69377C8.00489 8.71827 7.97743 8.73791 7.94689 8.75148C7.91636 8.76505 7.88338 8.77228 7.84997 8.77272H5.68865C5.16516 8.77272 4.66312 8.98068 4.29296 9.35084C3.9228 9.721 3.71484 10.223 3.71484 10.7465V14.1119C3.7157 14.5347 3.85234 14.9461 4.10464 15.2855C4.35694 15.6249 4.71155 15.8742 5.11625 15.9969C5.15859 16.0127 5.2047 16.0155 5.24866 16.0049C5.29261 15.9944 5.33242 15.971 5.36297 15.9376L15.4886 5.79227Z"
        className={cn(muteVariant({ variant }), className)}
      />
      <path
        d="M23.2063 2.68356C23.3901 2.49865 23.4933 2.24852 23.4933 1.98779C23.4933 1.72706 23.3901 1.47693 23.2063 1.29202C23.1145 1.19952 23.0054 1.1261 22.8851 1.076C22.7649 1.02589 22.6359 1.0001 22.5056 1.0001C22.3753 1.0001 22.2463 1.02589 22.126 1.076C22.0058 1.1261 21.8966 1.19952 21.8049 1.29202L1.28723 21.8196C1.10342 22.0045 1.00024 22.2546 1.00024 22.5153C1.00024 22.7761 1.10342 23.0262 1.28723 23.2111C1.33157 23.2564 1.38129 23.2962 1.43526 23.3295C1.62528 23.4588 1.85447 23.5177 2.08328 23.4961C2.3121 23.4745 2.52619 23.3737 2.68863 23.2111L8.71861 17.1712C8.76746 17.1275 8.83071 17.1034 8.89625 17.1034C8.9618 17.1034 9.02504 17.1275 9.0739 17.1712L13.8308 21.9775C13.9688 22.1166 14.1452 22.2116 14.3374 22.2501C14.5296 22.2887 14.7289 22.2691 14.9099 22.194C15.091 22.1188 15.2455 21.9914 15.3539 21.8281C15.4623 21.6647 15.5195 21.4728 15.5184 21.2768V10.4208C15.5204 10.3555 15.5448 10.2928 15.5875 10.2432L23.2063 2.68356Z"
        className={cn(muteVariant({ variant }), className)}
      />
    </svg>
  );
}
