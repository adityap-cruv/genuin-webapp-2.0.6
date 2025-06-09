import { Button } from "@genuin/ui/button";
import { NotificationIcon, PinIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";

import { Link } from "@molecules/link";
import { ShareButton } from "@molecules/share-button";

import { GenericDetails } from "../generic-details";
import { GenericDetailsMetadata } from "../generic-details/generic-details-metadata";

type OwnerInfoType = {
  userName: string;
  url: string;
};

type GroupInfoType = {
  name: string;
  isPrivate: boolean;
  url: string;
  stats: {
    members: number;
    posts: number;
    views: number;
  };
};

type GroupCardProps = {
  isPinned?: boolean;
  owner: OwnerInfoType;
  group: GroupInfoType;
} & ComponentProps<"div">;

export function GroupCard({
  isPinned,
  owner,
  group,
  className,
  ...restProps
}: GroupCardProps) {
  return (
    <div
      className={cn(
        "gencl:border gencl:w-[750px] gencl:rounded-lg gencl:p-4 gencl:space-y-4 gencl:border-secondary-300",
        className
      )}
      {...restProps}
    >
      {isPinned && (
        <div className="gencl:flex gencl:gap-2">
          <PinIcon className="gencl:fill-secondary-600" />
          <p className="gencl:text-secondary-600 gencl:text-body-1-medium">
            Pinned by @<Link href={owner.url}>{owner.userName}</Link>
          </p>
        </div>
      )}
      <GenericDetails
        variant="list"
        url={group.url}
        title={group.name}
        metadata={
          <GenericDetailsMetadata
            stats={{
              members: group.stats.members,
              posts: group.stats.posts,
              views: group.stats.views,
            }}
            privacyInfo={{
              isPrivate: group.isPrivate,
            }}
          />
        }
        ctas={
          <div className="gencl:flex gencl:gap-2">
            <Button size={"sm"}>Join</Button>
            <Button theme={"secondary"} size={"sm"} className="">
              <NotificationIcon />
            </Button>
            <ShareButton />
          </div>
        }
      />
    </div>
  );
}
