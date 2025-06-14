import { LockIcon, PublicIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/lib/utils";
import { ComponentProps } from "react";

type CommunityPrivacyInfoProps = {
  isPrivate: boolean;
  showPrivacyText?: boolean;
} & ComponentProps<"div">;

export function CommunityPrivacyInfo({
  isPrivate,
  showPrivacyText = true,
  className,
  ...restProps
}: CommunityPrivacyInfoProps) {
  return (
    <div
      className={cn(
        "gencl:flex gencl:[&_svg]:size-4  gencl:items-center gencl:gap-1",
        className
      )}
      {...restProps}
    >
      {isPrivate ? (
        <LockIcon className="gencl:stroke-secondary-600" />
      ) : (
        <PublicIcon className="gencl:stroke-secondary-600" />
      )}
      {showPrivacyText && (isPrivate ? " Private" : " Public")}
    </div>
  );
}
