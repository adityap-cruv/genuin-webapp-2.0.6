import { Avatar } from "@genuin/ui/components/avatar";
import { Stats } from "../../molecules/stats";
import { Image } from "@genuin/ui/components/image";
import { cn } from "@genuin/ui/lib/utils";
import { Skeleton } from "@genuin/ui/components/skeleton";
import { CommunityCardProps } from "./community-card.types";
import { ReadMore } from "@genuin/ui/components/read-more";
import { JoinCommunityButton } from "@genuin/components/molecules/join-community-button";
import { useState, MouseEvent } from "react";
import { CommunityUserRole } from "@genuin/components/types/post";
import {
  communityCardVariants,
  communityCardHeaderVariants,
  CommunityCardVariant,
} from "./community-card.cva";
import { CommunityPrivacyInfo } from "@genuin/components/molecules/community-privacy-info";
import { Link } from "@genuin/components/molecules/link";
import { DotIcon } from "@genuin/ui/icons";
import { DialogClose } from "@genuin/ui/components/dialog";
import { mapCommunityUserRole } from "@genuin/components/lib/utils";

function CommunityName({
  name,
  url,
  className,
  isCardClickable = false,
  onSelect,
  shouldCloseModal = false,
}: {
  name: string;
  url?: string;
  className: string;
  isCardClickable?: boolean;
  onSelect?: () => void;
  shouldCloseModal?: boolean;
}) {
  const nameElement = <h3 className={className}>{name}</h3>;

  // Don't create a nested link if the whole card is already clickable
  if (url && !isCardClickable) {
    const linkElement = (
      <Link href={url} className="focus:gencl:outline-none" onClick={onSelect}>
        {nameElement}
      </Link>
    );

    // Wrap with DialogClose only if we want to close modal
    if (shouldCloseModal) {
      return <DialogClose asChild>{linkElement}</DialogClose>;
    }

    return linkElement;
  }

  return nameElement;
}

function CommunityCardHeader({
  community,
  variant,
  role,
  setRole,
  url,
  onSelect = () => {},
  shouldCloseModal = false,
}: {
  community: CommunityCardProps["community"];
  variant: CommunityCardVariant;
  role: CommunityUserRole;
  setRole: (role: CommunityUserRole) => void;
  url?: string;
  onSelect?: () => void;
  shouldCloseModal?: boolean;
}) {
  const isCardClickable = variant === "recent" || variant === "suggestion";

  if (variant === "suggestion" || variant === "recent") {
    const showStats = variant === "suggestion";

    return (
      <div className={communityCardHeaderVariants({ variant })}>
        <Avatar
          imageUrl={community.dp}
          alt={community.name}
          isAvatar={false}
          size="md"
          className="gencl:shrink-0 gencl:border gencl:border-secondary-200"
        />
        <div className="gencl:flex gencl:flex-col gencl:gap-1 gencl:min-w-0 gencl:w-full">
          <div className="gencl:flex gencl:items-center gencl:gap-1">
            <CommunityName
              name={community.name}
              url={url}
              className="gencl:text-body-1-semi-bold gencl:line-clamp-1 gencl:break-all"
              isCardClickable={isCardClickable}
              shouldCloseModal={shouldCloseModal}
            />
            <CommunityPrivacyInfo
              isPrivate={community.type === "PRIVATE"}
              showPrivacyText={false}
            />
          </div>
          {community?.description && (
            <ReadMore
              maxLines={1}
              showExpandText={false}
              text={community.description}
              textClassName="gencl:!text-body-2-medium gencl:text-secondary-600 gencl:line-clamp-1"
              position="overlay"
            />
          )}
          {showStats && (
            <Stats
              className="gencl:flex gencl:!gap-2 gencl:text-body-1-medium! gencl:text-secondary-600"
              valueFirst={true}
              valueClassName="gencl:text-black! gencl:mr-1 gencl:text-body-2-medium"
              labelClassName="gencl:mr-2 gencl:text-body-2-medium"
              pairClassName="gencl:!gap-0"
              separator={<DotIcon />}
              stats={{
                Members: community.stats.members,
                Groups: community.stats.groups,
                Posts: community.stats.posts,
              }}
            />
          )}
        </div>
      </div>
    );
  }

  if (variant === "search") {
    return (
      <div className={communityCardHeaderVariants({ variant })}>
        <Avatar
          imageUrl={community.dp}
          alt={community.name}
          isAvatar={false}
          size="lg"
          className="gencl:shrink-0 gencl:border gencl:border-secondary-200"
        />
        <div className="gencl:flex gencl:justify-between gencl:items-start gencl:gap-3 gencl:w-full">
          <div className="gencl:items-start gencl:justify-between gencl:gap-3 gencl:mb-1">
            <div className="gencl:flex gencl:flex-row gencl:gap-1">
              <CommunityName
                name={community.name}
                url={url}
                className="gencl:text-body-1-semi-bold gencl:line-clamp-1 gencl:break-all"
                isCardClickable={isCardClickable}
                onSelect={onSelect}
                shouldCloseModal={shouldCloseModal}
              />
              <CommunityPrivacyInfo
                isPrivate={community.type === "PRIVATE"}
                showPrivacyText={false}
              />
            </div>
            <div>
              <Stats
                className="gencl:flex gencl:!gap-2 gencl:text-body-1-medium! gencl:text-secondary-600"
                valueFirst={true}
                valueClassName="gencl:text-black! gencl:mr-1 gencl:text-body-2-medium"
                labelClassName="gencl:mr-2 gencl:text-body-2-medium"
                pairClassName="gencl:!gap-0"
                separator={<DotIcon />}
                stats={{
                  Members: community.stats.members,
                  Groups: community.stats.groups,
                  Posts: community.stats.posts,
                }}
              />
            </div>
          </div>
          <div className="gencl:flex gencl:items-center gencl:gap-2">
            <JoinCommunityButton
              size="sm"
              role={role}
              isPrivate={false}
              communityId={community.id}
              communityHandle={community.handle || ""}
              communityName={community.name}
              slug={community.slug || ""}
              roleTexts={{ UNJOINED: "Join" }}
              onCommunityJoinStatusChange={setRole}
            >
              Join
            </JoinCommunityButton>
          </div>
        </div>
      </div>
    );
  }
  // explore variant
  return (
    <div className={communityCardHeaderVariants({ variant })}>
      {community.banner ? (
        <Image
          className="gencl:w-full gencl:h-15 gencl:object-cover"
          src={community.banner}
        />
      ) : (
        <div className="gencl:w-full gencl:h-15 gencl:bg-secondary-500" />
      )}
    </div>
  );
}

export function CommunityCard({
  community,
  variant = "explore",
  className,
  url,
  onSelect,
  shouldCloseModal = false,
  ...props
}: CommunityCardProps & {
  variant?: CommunityCardVariant;
  url?: string;
  onSelect?: (community: CommunityCardProps["community"]) => void;
  shouldCloseModal?: boolean;
}) {
  const [role, setRole] = useState<CommunityUserRole>(
    mapCommunityUserRole(
      community.logged_in_user_role,
      community.is_community_join_requested
    )
  );

  const cardContent = (
    <div
      className={cn(communityCardVariants({ variant }), className)}
      {...props}
    >
      <CommunityCardHeader
        community={community}
        variant={variant}
        role={role}
        setRole={setRole}
        url={url}
        shouldCloseModal={shouldCloseModal}
      />
      {variant !== "suggestion" && variant !== "recent" && (
        <>
          {/* Body section: name/description layout differs by variant */}
          <div
            className={
              variant === "explore"
                ? "gencl:px-4 gencl:py-3 gencl:flex-1 "
                : "gencl:flex gencl:flex-col gencl:gap-3 gencl:w-full gencl:mt-2"
            }
          >
            {variant === "explore" ? (
              <div className="gencl:flex gencl:justify-between gencl:items-start gencl:gap-3">
                <div className="gencl:flex gencl:items-center gencl:gap-2">
                  <Avatar
                    imageUrl={community.dp}
                    alt={community.name}
                    isAvatar={false}
                    size="lg"
                    className="gencl:shrink-0 gencl:border gencl:border-secondary-150"
                  />
                  <ReadMore
                    maxChars={40}
                    showExpandText={false}
                    text={community.name}
                    textClassName="gencl:!text-body-1-semi-bold gencl:line-clamp-2 gencl:break-all"
                  />
                </div>
                <JoinCommunityButton
                  role={role}
                  isPrivate={false}
                  communityId={community.id}
                  communityHandle=""
                  communityName=""
                  slug=""
                  roleTexts={{ UNJOINED: "Join" }}
                  onCommunityJoinStatusChange={setRole}
                  onClick={(e: MouseEvent<HTMLButtonElement>) => {
                    e.stopPropagation();
                    e.preventDefault();
                  }}
                >
                  Join
                </JoinCommunityButton>
              </div>
            ) : null}
            {community?.description && (
              <ReadMore
                maxLines={2}
                showExpandText={variant === "search"}
                text={community.description}
                textClassName="gencl:!text-body-2-medium gencl:text-secondary-600 gencl:line-clamp-2 gencl:mt-0"
                viewMoreText="more"
                position="overlay"
              />
            )}
          </div>
          {/* Stats section */}
          {variant === "explore" ? (
            <div className="gencl:px-4 gencl:py-3 gencl:bg-secondary-50">
              <Stats
                className="gencl:flex gencl:justify-between"
                valueClassName="gencl:text-body-2-bold"
                labelClassName="gencl:text-body-2-medium! gencl:text-secondary-700"
                pairClassName="gencl:flex-col gencl:!gap-0 gencl:items-start"
                stats={{
                  Members: community.stats.members,
                  Groups: community.stats.groups,
                  Posts: community.stats.posts,
                }}
                valueFirst
              />
            </div>
          ) : null}
        </>
      )}
    </div>
  );

  // For recent variant, make the whole card clickable
  if ((variant === "recent" || variant === "suggestion") && url) {
    return (
      <Link href={url} className="focus:gencl:outline-none gencl:w-full">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

export function CommunityCardSkeleton({
  className,
  variant = "explore",
}: {
  className?: string;
  variant?: CommunityCardVariant;
}) {
  if (variant === "suggestion" || variant === "recent") {
    return (
      <div className={cn(communityCardVariants({ variant }), className)}>
        <div className={communityCardHeaderVariants({ variant })}>
          <Skeleton className="gencl:size-10 gencl:shrink-0 gencl:rounded-full gencl:border gencl:border-secondary-200" />
          <div className="gencl:flex gencl:justify-between gencl:items-center gencl:w-full">
            <div className="gencl:flex gencl:flex-col gencl:gap-1 gencl:min-w-0">
              <div className="gencl:flex gencl:items-center gencl:gap-1">
                <Skeleton className="gencl:w-24 gencl:h-4" />
                <Skeleton className="gencl:w-3 gencl:h-3 gencl:rounded-full" />
              </div>
              <Skeleton className="gencl:w-16 gencl:h-3" />
              {variant === "suggestion" && (
                <div className="gencl:flex gencl:gap-1 gencl:items-center">
                  <Skeleton className="gencl:w-8 gencl:h-3" />
                  <Skeleton className="gencl:w-12 gencl:h-3" />
                  <span className="gencl:text-secondary-600">•</span>
                  <Skeleton className="gencl:w-8 gencl:h-3" />
                  <Skeleton className="gencl:w-12 gencl:h-3" />
                  <span className="gencl:text-secondary-600">•</span>
                  <Skeleton className="gencl:w-8 gencl:h-3" />
                  <Skeleton className="gencl:w-8 gencl:h-3" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "search") {
    return (
      <div className={cn(communityCardVariants({ variant }), className)}>
        {/* Header section matching search variant layout */}
        <div className={communityCardHeaderVariants({ variant })}>
          <Skeleton className="gencl:size-11 gencl:shrink-0 gencl:rounded-full gencl:border gencl:border-secondary-200" />
          <div className="gencl:flex gencl:justify-between gencl:items-start gencl:gap-3 gencl:w-full">
            <div className="gencl:items-start gencl:justify-between gencl:gap-3 gencl:mb-1">
              {/* Name and privacy info row */}
              <div className="gencl:flex gencl:flex-row gencl:gap-1 gencl:mb-2">
                <Skeleton className="gencl:w-32 gencl:h-5" />
                <Skeleton className="gencl:w-4 gencl:h-4 gencl:rounded-full" />
              </div>
              {/* Stats row with separators */}
              <div className="gencl:flex gencl:gap-1 gencl:items-center">
                <Skeleton className="gencl:w-8 gencl:h-4" />
                <Skeleton className="gencl:w-12 gencl:h-4" />
                <span className="gencl:text-secondary-600">•</span>
                <Skeleton className="gencl:w-8 gencl:h-4" />
                <Skeleton className="gencl:w-12 gencl:h-4" />
                <span className="gencl:text-secondary-600">•</span>
                <Skeleton className="gencl:w-8 gencl:h-4" />
                <Skeleton className="gencl:w-8 gencl:h-4" />
              </div>
            </div>
            <div className="gencl:flex gencl:items-center gencl:gap-2">
              <Skeleton className="gencl:w-16 gencl:h-8 gencl:rounded-lg" />
            </div>
          </div>
        </div>
        {/* Description section */}
        <div className="gencl:flex gencl:flex-col gencl:gap-3 gencl:w-full gencl:mt-2">
          <div className="gencl:flex gencl:flex-col gencl:gap-2">
            <Skeleton className="gencl:w-full gencl:h-4" />
            <Skeleton className="gencl:w-3/4 gencl:h-4" />
          </div>
        </div>
      </div>
    );
  }

  // explore variant
  return (
    <div className={cn(communityCardVariants({ variant }), className)}>
      <div className="gencl:w-full">
        <Skeleton className="gencl:w-full gencl:h-15 gencl:rounded-none" />
      </div>
      <div className="gencl:p-4">
        <div className="gencl:flex gencl:justify-between gencl:items-start gencl:gap-3 gencl:mb-3">
          <div className="gencl:w-full gencl:flex gencl:items-center gencl:gap-2">
            <Skeleton className="gencl:size-11 gencl:shrink-0 gencl:rounded-full" />
            <div className="gencl:flex gencl:flex-col gencl:gap-2 gencl:w-full">
              <Skeleton className="gencl:w-full gencl:h-3" />
              <Skeleton className="gencl:w-full gencl:h-3" />
            </div>
          </div>
          <Skeleton className="gencl:w-16 gencl:h-8 gencl:bg-secondary-100 gencl:rounded-lg" />
        </div>
        <div className="gencl:flex gencl:flex-col gencl:gap-2">
          <Skeleton className="gencl:w-full gencl:h-3" />
          <Skeleton className="gencl:w-full gencl:h-3" />
        </div>
      </div>
      <div className="gencl:flex gencl:justify-between gencl:p-4 gencl:bg-secondary-50">
        {Array.from({ length: 3 }).map((_, index) => (
          <div className="gencl:flex gencl:flex-col gencl:gap-2" key={index}>
            <Skeleton className="gencl:w-8 gencl:h-3" />
            <Skeleton className="gencl:w-15 gencl:h-3" />
          </div>
        ))}
      </div>
    </div>
  );
}
