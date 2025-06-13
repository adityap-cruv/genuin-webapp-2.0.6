import { Image } from "@genuin/ui/image";
import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";

import { useBaseContext } from "@genuin/components/context/base";
import { Link } from "@molecules/link";
import { buildPageUrl } from "@lib/utils/pages";

type BrandLogoProps = ComponentProps<typeof Image>;

export function BrandLogo({ className, ...props }: BrandLogoProps) {
  const { brandDetails } = useBaseContext();
  return (
    <Link href={buildPageUrl({type : "home"})}>
      <Image
        src={brandDetails.brand_web_logo}
        alt="Brand Logo"
        useWebp={false}
        className={cn("gencl:max-w-44", className)}
        {...props}
      />
    </Link>
  );
}
