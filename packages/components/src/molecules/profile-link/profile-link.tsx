import type { ComponentProps } from "react";

import { BrandBadge } from "../brand-badge";
import { Link } from "../link";

type ProfileLinkPropsType = {
  url?: string;
  /**
   * Render the GenuinBadge component if userLogoType is 1.
   *
   * Render the BrandBadge component if userLogoType is 2.
   *
   * Render the VerifiedBadge component if userLogoType is 3
   */
  userLogoType?: number | null;
} & ComponentProps<"p">;

export function ProfileLink({
  url,
  userLogoType,
  children,
  ...restProps
}: ProfileLinkPropsType) {
  return (
    <Link href={url}>
      <div className="gencl:flex gencl:items-center gencl:gap-1">
        <p {...restProps}>{children}</p>
        {userLogoType && (
          <BrandBadge userLogoType={userLogoType} variant="dark" />
        )}
      </div>
    </Link>
  );
}
