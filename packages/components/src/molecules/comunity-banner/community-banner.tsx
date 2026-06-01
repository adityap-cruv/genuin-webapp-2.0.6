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
    <div className={cn("gencl:aspect-[5/1] gencl:bg-secondary-300 gencl:rounded-lg gencl:overflow-hidden", className)}>
      <Image src={src} className="gencl:w-full gencl:h-full gencl:object-cover" alt={undefined} {...restProps} />
    </div>
  );
}
