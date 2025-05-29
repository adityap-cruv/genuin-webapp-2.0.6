import { TickIcon } from "@genuin/ui/icons";
import { PublicIcon, LockIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";

import { Link } from "src/molecules/link";
import { Stats } from "src/molecules/stats/stats";

type GenericDetailsMetadataProps = ComponentProps<"div"> & {
  brandDetails?: {
    userName: string;
    isVerified: boolean;
    url: string;
  };
  stats?: Record<string, number>;
  privacyInfo?: {
    isPrivate: boolean;
  };
};

export function GenericDetailsMetadata({
  brandDetails,
  stats,
  privacyInfo,
  className,
  ...restProps
}: GenericDetailsMetadataProps) {
  return (
    <div
      className={cn(
        "gencl:text-body-1-medium! gencl:text-secondary-600 gencl:flex gencl:gap-2",
        className
      )}
      {...restProps}
    >
      {/** todo: replace it with <PrivacyInfo/> component. */}
      {privacyInfo && (
        <>
          <div className="gencl:flex gencl:[&_svg]:size-4  gencl:items-center gencl:gap-1">
            {privacyInfo.isPrivate ? (
              <LockIcon className="gencl:stroke-secondary-600" />
            ) : (
              <PublicIcon className="gencl:stroke-secondary-600" />
            )}
            {privacyInfo.isPrivate ? " Private" : " Public"}
          </div>
          <p>•</p>
        </>
      )}
      {brandDetails && (
        <>
          <span className="gencl:flex gencl:items-center">
            <Link href={brandDetails.url}>@{brandDetails.userName}</Link>&nbsp;
            <TickIcon className="gencl:size-3" />
          </span>
          <p>•</p>
        </>
      )}
      {stats && (
        <Stats
          stats={stats}
          className="gencl:flex gencl:gap-1"
          valueFirst={true}
          valueClassName="gencl:text-black! gencl:mr-1"
          labelClassName="gencl:mr-1"
          separator="•"
        />
      )}
    </div>
  );
}
