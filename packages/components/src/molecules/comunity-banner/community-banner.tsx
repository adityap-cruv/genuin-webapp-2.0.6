import { Image } from "@genuin/ui/components/image";
import { cn } from "@genuin/ui/lib/utils";
import { ComponentProps } from "react";

export function CommunityBanner({
  src,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  alt,
  className,
  children,
  ...restProps
}: ComponentProps<typeof Image>) {
  return (
    <Image
      src={src}
      alt={undefined}
      className={cn(
        "gencl:w-full gencl:h-15 gencl:sm:h-40 gencl:bg-secondary-300 gencl:rounded-none gencl:sm:rounded-b-lg!",
        className
      )}
      {...restProps}
    />
  );
}
