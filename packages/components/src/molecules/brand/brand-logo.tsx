import { Image } from "@genuin/ui/image";
import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";

import { useBaseContext } from "@genuin/components/context/base";
import { Link } from "@genuin/components/molecules/link";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";

type BrandLogoProps = ComponentProps<typeof Image>;

export function BrandLogo({ className, ...props }: BrandLogoProps) {
  const { brandDetails } = useBaseContext();
  const { isMobile } = useDeviceDetectMediaQuery();
  return (
    <Link href={buildPageUrl({ type: "home" })}>
      <Image
        src={isMobile ? brandDetails.logo : brandDetails.brand_web_logo}
        alt="Brand Logo"
        useWebp={false}
        className={cn(
          "gencl:h-10 gencl:w-auto gencl:max-w-40 gencl:object-contain",
          className
        )}
        {...props}
      />
    </Link>
  );
}
