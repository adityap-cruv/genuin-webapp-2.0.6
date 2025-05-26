import { useBaseContext } from "src/context/base";
import { Image } from "@genuin/ui/image";
import { ComponentProps } from "react";
import { cn } from "@genuin/ui/utils";

type BrandLogoProps = ComponentProps<typeof Image>;

export function BrandLogo({ className, ...props }: BrandLogoProps) {
  const { brandDetails } = useBaseContext();
  return (
    <Image
      src={brandDetails.brand_web_logo}
      alt="Brand Logo"
      className={cn("gencl:w-44", className)}
      {...props}
    />
  );
}
