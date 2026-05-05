import { Image } from "@genuin/ui/components/image";
import { cn } from "@genuin/ui/lib/utils";
import type { ComponentProps } from "react";

export function CommunityBanner({
  src,

  alt,
  className,
  children,
  ...restProps
}: ComponentProps<typeof Image>) {
  return (
    <div
      className={cn(
        "gencl:max-w-4xl gencl:mx-auto gencl:aspect-[5/1] gencl:sm:h-40! gencl:bg-secondary-300 gencl:rounded-none gencl:overflow-hidden gencl:sm:rounded-b-lg!",
        className
      )}>
      <Image src={src} className="gencl:w-full gencl:h-full" alt={undefined} {...restProps} />
    </div>
  );
}
