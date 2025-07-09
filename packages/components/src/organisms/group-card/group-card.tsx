import { Button } from "@genuin/ui/button";
import {
  NotificationIcon,
  PinIcon,
  GroupIcon,
  DotIcon,
} from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import { Skeleton } from "@genuin/ui/skeleton";
import type { ComponentProps } from "react";

import { Link } from "@genuin/components/molecules/link";
import { Stats } from "@genuin/components/molecules/stats";
import { JoinGroupButton } from "@genuin/components/molecules/join-group-button";

import { GenericDetails } from "../generic-details";
import { GenericDetailsMetadata } from "../generic-details/generic-details-metadata";
import {
  groupCardVariants,
  groupCardContentVariants,
  GroupCardVariant,
} from "./group-card.cva";
import { ReadMore } from "@genuin/ui/components/read-more";
import { CommunityPrivacyInfo } from "@genuin/components/molecules/community-privacy-info";
import { DialogClose } from "@genuin/ui/components/dialog";
import { GroupUserStatusType } from "@genuin/components/types/roles";

type OwnerInfoType = {
  userName: string;
  url: string;
};

type GroupInfoType = {
  chat_id: string;
  name: string;
  isPrivate: boolean;
  url: string;
  slug: string;
  description?: string;
  role?: GroupUserStatusType;
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
  variant?: GroupCardVariant;
  url?: string;
  shouldCloseModal?: boolean;
  onClick?: () => void;
} & ComponentProps<"div">;

type GroupNameProps = {
  name: string;
  url?: string;
  className: string;
  isCardClickable?: boolean;
  shouldCloseModal?: boolean;
};

function GroupName({
  name,
  url,
  className,
  isCardClickable = false,
  shouldCloseModal = false,
  variant,
}: GroupNameProps & { variant?: GroupCardVariant }) {
  const nameElement = <h3 className={className}>{name}</h3>;

  // Don't create a nested link if the whole card is already clickable
  if (url && !isCardClickable) {
    const linkElement = (
      <Link
        href={url}
        className="gencl:cursor-pointer hover:gencl:underline focus:gencl:outline-none"
      >
        {nameElement}
      </Link>
    );

    // Only wrap with DialogClose for search variant when shouldCloseModal is true
    if (shouldCloseModal && variant === "search") {
      return <DialogClose asChild>{linkElement}</DialogClose>;
    }

    return linkElement;
  }

  return nameElement;
}

export function GroupCard({
  isPinned,
  owner,
  group,
  variant = "explore",
  className,
  url,
  shouldCloseModal = false,
  onClick,
  ...restProps
}: GroupCardProps) {
  const isCardClickable = variant === "recent" || variant === "suggestion";

  const cardContent = (
    <div
      className={cn(groupCardVariants({ variant }), className)}
      {...restProps}
    >
      <div className={groupCardContentVariants({ variant })}>
        {variant === "explore" ? (
          <>
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
              url={url}
              title={group.name}
              metadata={
                <GenericDetailsMetadata
                  stats={{
                    Members: group.stats?.members ?? 0,
                    Posts: group.stats?.posts ?? 0,
                    Views: group.stats?.views ?? 0,
                  }}
                  privacyInfo={{
                    isPrivate: group.isPrivate,
                  }}
                />
              }
              ctas={
                <div className="gencl:flex gencl:gap-2">
                  <JoinGroupButton
                    size="sm"
                    groupId={group.chat_id}
                    groupName={group.name}
                    groupDescription={group.description || ""}
                    shareUrl={group.url}
                    role={group.role || "UNJOINED"}
                    isPrivate={group.isPrivate}
                    buttonTexts={{
                      UNJOINED: "Join",
                    }}
                  />
                  <Button theme={"secondary"} size={"sm"} className="">
                    <NotificationIcon />
                  </Button>
                  {/* <ShareButton
                    pathName={buildPageUrl({
                      type: "group",
                      slug: group.slug,
                    })}
                  /> */}
                </div>
              }
            />
          </>
        ) : variant === "search" ? (
          // Search variant
          <>
            <div className="gencl:flex gencl:flex-col gencl:gap-2 gencl:flex-1">
              <div className="gencl:flex gencl:items-center gencl:gap-2">
                <div className="gencl:flex gencl:gap-1 gencl::items-space-between gencl:w-full">
                  <GroupName
                    name={group.name}
                    url={url}
                    className="gencl:text-body-1-semi-bold gencl:line-clamp-1 gencl:break-all"
                    isCardClickable={isCardClickable}
                    shouldCloseModal={shouldCloseModal}
                    variant={variant}
                  />
                  <CommunityPrivacyInfo
                    isPrivate={group.isPrivate}
                    showPrivacyText={false}
                    className="gencl:text-body-2-medium gencl:text-secondary-600"
                  />
                </div>
                <div className="gencl:flex gencl:items-center gencl:gap-2">
                  <JoinGroupButton
                    size="sm"
                    groupId={group.chat_id}
                    groupName={group.name}
                    groupDescription={group.description || ""}
                    shareUrl={group.url}
                    role={group.role || "UNJOINED"}
                    isPrivate={group.isPrivate}
                    buttonTexts={{
                      UNJOINED: "Join",
                    }}
                  />
                </div>
              </div>

              {group?.description && (
                <ReadMore
                  maxLines={2}
                  showExpandText={variant === "search"}
                  text={group.description}
                  textClassName="gencl:!text-body-2-medium gencl:text-secondary-600 gencl:line-clamp-2 gencl:mt-0 gencl:pr-1"
                  viewMoreText="more"
                  position="outside"
                />
              )}
              <Stats
                className="gencl:flex gencl:gap-1 gencl:text-body-1-medium! gencl:text-secondary-600"
                valueFirst={true}
                valueClassName="gencl:text-black! gencl:text-body-2-medium"
                labelClassName="gencl:mr-1 gencl:text-body-2-medium"
                pairClassName="gencl:!gap-1"
                separator={<DotIcon />}
                stats={{
                  Members: group.stats?.members ?? 0,
                  Posts: group.stats?.posts ?? 0,
                  Views: group.stats?.views ?? 0,
                }}
              />
            </div>
          </>
        ) : variant === "recent" ? (
          // Recent variant - without stats, similar to community card
          <>
            <div className="gencl:rounded-full gencl:bg-secondary-50 gencl:p-2">
              <GroupIcon
                variant="filled"
                className="gencl:h-6 gencl:w-6 gencl:text-secondary-600"
              />
            </div>
            <div className="gencl:flex gencl:flex-col gencl:gap-1 gencl:flex-1 gencl:min-w-0">
              <div className="gencl:flex gencl:items-center gencl:gap-2 gencl:w-full">
                <GroupName
                  name={group.name}
                  url={url}
                  className="gencl:text-body-1-semi-bold gencl:line-clamp-1 gencl:break-all"
                  isCardClickable={isCardClickable}
                  shouldCloseModal={shouldCloseModal}
                  variant={variant}
                />
              </div>

              {group?.description && (
                <ReadMore
                  maxLines={1}
                  showExpandText={false}
                  text={group.description}
                  textClassName="gencl:!text-body-2-medium gencl:text-secondary-600 gencl:line-clamp-1 gencl:mt-0 gencl:pr-1"
                  viewMoreText="more"
                  position="outside"
                />
              )}
            </div>
          </>
        ) : (
          // Suggestion variant
          <>
            <div className="gencl:rounded-full gencl:bg-secondary-50 gencl:p-1">
              <GroupIcon
                variant="filled"
                className="gencl:h-8 gencl:w-8 gencl:text-secondary-600"
              />
            </div>
            <div className="gencl:flex gencl:flex-col gencl:gap-1 gencl:flex-1 gencl:min-w-0">
              <div className="gencl:flex gencl:items-center gencl:gap-2 gencl:w-full">
                <GroupName
                  name={group.name}
                  url={url}
                  className="gencl:text-body-1-semi-bold gencl:line-clamp-1 gencl:break-all"
                  isCardClickable={isCardClickable}
                  shouldCloseModal={shouldCloseModal}
                  variant={variant}
                />
                <CommunityPrivacyInfo
                  isPrivate={group.isPrivate}
                  showPrivacyText={false}
                  className="gencl:text-body-2-medium gencl:text-secondary-600"
                />
              </div>

              {group?.description && (
                <ReadMore
                  maxLines={1}
                  showExpandText={false}
                  text={group.description}
                  textClassName="gencl:!text-body-2-medium gencl:text-secondary-600 gencl:line-clamp-1 gencl:mt-0 gencl:pr-1"
                  viewMoreText="more"
                  position="outside"
                />
              )}

              <Stats
                className="gencl:flex gencl:!gap-1 gencl:text-body-1-medium! gencl:text-secondary-600"
                valueFirst={true}
                valueClassName="gencl:text-black! gencl:text-body-2-medium"
                labelClassName="gencl:mr-1 gencl:text-body-2-medium"
                pairClassName="gencl:!gap-1"
                separator={<DotIcon />}
                stats={{
                  Members: group.stats?.members ?? 0,
                  Posts: group.stats?.posts ?? 0,
                }}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );

  // For recent variant, make the whole card clickable
  if ((variant === "recent" || variant === "suggestion") && url) {
    const linkElement = (
      <Link href={url} className="gencl:focus:outline-none gencl:w-full">
        {cardContent}
      </Link>
    );

    // For recent variant, wrap with DialogClose when shouldCloseModal is true
    if (shouldCloseModal && variant === "recent") {
      return <DialogClose asChild>{linkElement}</DialogClose>;
    }

    return linkElement;
  }

  return cardContent;
}

export function GroupCardSkeleton({
  variant = "explore",
  className,
}: {
  variant?: GroupCardVariant;
  className?: string;
}) {
  return (
    <div className={cn(groupCardVariants({ variant }), className)}>
      {variant === "explore" ? (
        <div className="gencl:w-full gencl:flex gencl:flex-col gencl:gap-3">
          <div className="gencl:flex gencl:justify-between gencl:items-center">
            <Skeleton className="gencl:w-[30%] gencl:h-9 gencl:rounded-md" />
            <div className="gencl:flex gencl:gap-2">
              <Skeleton className="gencl:w-12 gencl:h-9 gencl:rounded-md" />
              <Skeleton className="gencl:w-12 gencl:h-9 gencl:rounded-md" />
              <Skeleton className="gencl:w-12 gencl:h-9 gencl:rounded-md" />
            </div>
          </div>
          <div className="gencl:flex gencl:items-center gencl:gap-2">
            {Array.from({ length: 4 }).map((_, idx, arr) => (
              <div key={idx}>
                <Skeleton className="gencl:w-18 gencl:h-4 gencl:rounded-md" />
                {idx < arr.length - 1 && (
                  <Skeleton className="gencl:w-1 gencl:h-1 gencl:rounded-md" />
                )}
              </div>
            ))}
          </div>
        </div>
      ) : variant === "search" ? (
        // Search variant skeleton
        <div className="gencl:flex gencl:justify-between gencl:items-start gencl:gap-3 gencl:w-full">
          <div className="gencl:flex gencl:flex-col gencl:gap-2 gencl:flex-1">
            <Skeleton className="gencl:w-[60%] gencl:h-6 gencl:rounded-md" />
            <div className="gencl:flex gencl:items-center gencl:gap-2">
              {Array.from({ length: 3 }).map((_, idx) => (
                <Skeleton
                  key={idx}
                  className="gencl:w-16 gencl:h-4 gencl:rounded-md"
                />
              ))}
            </div>
          </div>
          <div className="gencl:flex gencl:gap-2">
            <Skeleton className="gencl:w-12 gencl:h-8 gencl:rounded-md" />
          </div>
        </div>
      ) : variant === "recent" ? (
        // Recent variant skeleton - without stats
        <div className="gencl:flex gencl:justify-between gencl:items-start gencl:gap-3 gencl:w-full">
          <Skeleton className="gencl:w-10 gencl:h-10 gencl:rounded-full gencl:flex-shrink-0" />
          <div className="gencl:flex gencl:flex-col gencl:gap-1 gencl:flex-1">
            <div className="gencl:flex gencl:items-center gencl:gap-2">
              <Skeleton className="gencl:w-[50%] gencl:h-5 gencl:rounded-md" />
              <Skeleton className="gencl:w-4 gencl:h-4 gencl:rounded-md" />
            </div>
            <Skeleton className="gencl:w-[80%] gencl:h-4 gencl:rounded-md" />
          </div>
        </div>
      ) : (
        // Suggestion variant skeleton
        <div className="gencl:flex gencl:justify-between gencl:items-start gencl:gap-3 gencl:w-full">
          <Skeleton className="gencl:w-10 gencl:h-10 gencl:rounded-full gencl:flex-shrink-0" />
          <div className="gencl:flex gencl:flex-col gencl:gap-1 gencl:flex-1">
            <div className="gencl:flex gencl:items-center gencl:gap-2">
              <Skeleton className="gencl:w-[50%] gencl:h-5 gencl:rounded-md" />
              <Skeleton className="gencl:w-4 gencl:h-4 gencl:rounded-md" />
            </div>
            <Skeleton className="gencl:w-[80%] gencl:h-4 gencl:rounded-md" />
            <div className="gencl:flex gencl:items-center gencl:gap-2">
              {Array.from({ length: 2 }).map((_, idx) => (
                <Skeleton
                  key={idx}
                  className="gencl:w-12 gencl:h-3 gencl:rounded-md"
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
