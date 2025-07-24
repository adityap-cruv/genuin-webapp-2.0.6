import { Image } from "@genuin/ui/image";
import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";

import { useBaseContext } from "@genuin/components/context/base";
import { Link } from "@genuin/components/molecules/link";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { useDeviceDetectMediaQuery } from "@genuin/components/hooks/use-devide-detect-media-query";

type LogoType = "logo" | "brand_web_logo";

type BrandLogoProps = ComponentProps<typeof Image> & {
  /**
   * Explicitly specify which logo to use.
   * If not provided, logo will be selected based on device type.
   */
  logoType?: LogoType;
};

export function BrandLogo({ className, logoType, ...props }: BrandLogoProps) {
  const { brandDetails } = useBaseContext();
  const { isMobile } = useDeviceDetectMediaQuery();

  // Determine which logo to use based on props or device detection
  const logoSrc = logoType
    ? logoType === "logo"
      ? brandDetails.logo
      : brandDetails.brand_web_logo
    : isMobile
      ? brandDetails.logo
      : brandDetails.brand_web_logo;

  return (
    <Link href={buildPageUrl({ type: "home" })}>
      <Image
        src={logoSrc}
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
