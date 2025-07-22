import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";

import { cn, defaultSizesForIcons } from "@genuin/ui/lib/utils";

import type { SVGIconsProps } from "../type";

const repostIconVariants = cva("", {
  variants: {
    theme: {
      light: "gencl:fill-black",
      dark: "gencl:fill-white",
      secondary: "gencl:fill-secondary-600",
    },
    size: defaultSizesForIcons(),
  },
  defaultVariants: {
    theme: "light",
  },
});

type SparkIconProps = SVGIconsProps & VariantProps<typeof repostIconVariants>;

export function SparkIcon({
  className,
  theme,
  size,
  ...restProps
}: SparkIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={cn(repostIconVariants({ theme, size }), className)}
      {...restProps}
    >
      <path d="M15.1162 19.1424C15.5304 19.1424 15.8306 19.4511 15.7451 19.7596C15.388 21.0395 13.9311 21.9997 12.1885 21.9998C10.4458 21.9998 8.98894 21.0396 8.63184 19.7596C8.54625 19.4397 8.84572 19.1425 9.25977 19.1424H15.1162ZM12.1973 1.9998C16.4518 2.01475 19.9334 5.32411 20.0254 9.47832C20.0365 9.52835 20.0449 9.57997 20.0449 9.63262C20.0449 11.9876 18.9338 14.1886 17.0605 15.6219L16.6758 15.8982L16.6582 15.91C16.5465 15.9807 16.4767 16.1073 16.4766 16.2469V17.1326C16.4765 17.8659 15.8648 18.4275 15.1631 18.4275H9.21191C8.51043 18.4272 7.89852 17.8657 7.89844 17.1326V16.2469C7.89831 16.1347 7.83673 15.9947 7.6875 15.8895V15.8885C5.59202 14.4581 4.33115 12.1274 4.33105 9.61895C4.33125 5.38356 7.88464 1.98491 12.1973 1.9998ZM12.1924 3.42754C8.62782 3.4152 5.75899 6.2166 5.75879 9.61895C5.75888 11.5181 6.65529 13.3056 8.18652 14.4871L8.50098 14.7156L8.51074 14.7225L8.68359 14.8582C9.06871 15.1986 9.32704 15.6914 9.32715 16.2469V16.9998H15.0488V16.2469C15.0489 15.6397 15.3502 15.0462 15.8945 14.702C17.5676 13.5684 18.5695 11.7321 18.6113 9.76055C18.6053 9.7233 18.6016 9.68483 18.6016 9.64629C18.6013 6.24098 15.7581 3.44007 12.1924 3.42754Z" />
    </svg>
  );
}
