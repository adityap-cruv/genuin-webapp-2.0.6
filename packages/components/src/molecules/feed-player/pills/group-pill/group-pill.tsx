"use client";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@genuin/ui/hover-card";
import { cva } from "class-variance-authority";

import { GroupSubscriptionButton } from "@genuin/components/molecules/group-subscription-button";
import { Link } from "@genuin/components/molecules/link";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { useAuthContext } from "@genuin/components/context/auth";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { GroupHoverCard } from "../group-hover-card";
import { ComponentProps, useState, useEffect, useRef } from "react";
import { JoinGroupButton } from "@genuin/components/molecules/join-group-button";
import { GroupIcon } from "@genuin/ui/icons";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";

const groupPillVariants = cva(
  "gencl:flex gencl:w-fit gencl:items-center gencl:gap-1 gencl:p-1 gencl:pr-2 gencl:rounded-full gencl:transition-all gencl:cursor-pointer",
  {
    variants: {
      variant: {
        light:
          "gencl:bg-white gencl:text-default gencl:border gencl:border-secondary-150 gencl:hover:bg-secondary-50 gencl:hover:border-secondary-50",
        dark: "gencl:bg-black/40 gencl:text-white",
        fullScreen:
          "gencl:!bg-black/40 gencl:backdrop-blur-lg gencl:text-white gencl:border-none",
        compact:
          "gencl:bg-secondary-50! gencl:text-default gencl:border-none gencl:hover:bg-secondary-150!",
      },
    },
    defaultVariants: {
      variant: "light",
    },
  }
);

type GroupPillProps = {
  isHoverable?: boolean;
  variant?: "light" | "dark" | "fullScreen" | "compact";
  groupDetails: PostDetailsType["group"];
  communityDetails: PostDetailsType["community"];
  videoId?: string;
  className?: string;
  onGroupJoinStatusChange: ComponentProps<
    typeof JoinGroupButton
  >["onGroupJoinStatusChange"];
  onGroupSubscriptionChange?: ComponentProps<
    typeof GroupSubscriptionButton
  >["onSubscriptionChange"];
  hideGroupSubscriptionButton?: boolean;
};

export function GroupPill({
  isHoverable = false,
  variant = "light",
  groupDetails,
  communityDetails,
  videoId,
  onGroupJoinStatusChange,
  onGroupSubscriptionChange,
  className,
  hideGroupSubscriptionButton = false,
}: GroupPillProps) {
  const { authenticationStatus } = useAuthContext();
  const [localSubscriptionStatus, setLocalSubscriptionStatus] = useState<
    undefined | boolean
  >(undefined);
  const prevSubscriptionStatus = useRef<boolean | undefined>(undefined);

  /**
   * When the user successfully subscribes (isSubscribed becomes true),
   * keep the subscription button visible for 3 seconds to show the updated status/animation,
   * then hide it. For all other subscription status changes, update immediately.
   */
  useEffect(() => {
    if (
      prevSubscriptionStatus.current === false &&
      groupDetails.isSubscribed === true
    ) {
      setLocalSubscriptionStatus(true);
    } else {
      setLocalSubscriptionStatus(groupDetails.isSubscribed);
    }
    prevSubscriptionStatus.current = groupDetails.isSubscribed;
  }, [groupDetails.isSubscribed]);

  const hideButton = localSubscriptionStatus === true;

  // Truncate name to 24 characters for compact variant
  const displayName =
    variant === "compact" && groupDetails.name && groupDetails.name.length > 24
      ? `${groupDetails.name.substring(0, 24)}...`
      : groupDetails.name;

  const ldDescription = `${
    groupDetails?.description ? groupDetails.description + " | " : ""
  } • Join ${groupDetails.name} to talk about it`;

  const pill = (
    <Link href={buildPageUrl({ type: "group", slug: groupDetails.slug })}>
      <div className={groupPillVariants({ variant, className })}>
        <div className="gencl:flex gencl:gap-1 gencl:items-center gencl:line-clamp-1 gencl:break-all">
          <div className="gencl:rounded-full gencl:bg-secondary-600 gencl:p-1">
            <GroupIcon theme="dark" size="sm" />
          </div>
          <span className="gencl:text-body-2-medium gencl:line-clamp-1">
            {displayName}
          </span>
        </div>
        {authenticationStatus === "authenticated" &&
          variant !== "compact" &&
          !hideGroupSubscriptionButton && (
            <div
              className={`gencl:overflow-hidden gencl:!flex gencl:shrink-0 gencl:transition-all gencl:duration-500 ${
                hideButton
                  ? "gencl:max-w-0 gencl:opacity-0 gencl:ml-0 gencl:px-0!"
                  : "gencl:max-w-24 gencl:opacity-100 gencl:ml-1"
              }`}
            >
              <GroupSubscriptionButton
                className="gencl:px-2 gencl:h-6"
                variant="icon"
                shape="pill"
                size="sm"
                groupId={groupDetails.id}
                groupName={groupDetails.name ?? ""}
                groupDescription={ldDescription}
                groupSlug={groupDetails.slug}
                shareUrl={groupDetails.shareUrl ?? ""}
                isSubscriber={groupDetails.isSubscribed ?? false}
                videoId={videoId}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onSubscriptionChange={onGroupSubscriptionChange}
              />
            </div>
          )}
      </div>
    </Link>
  );

  if (!isHoverable || variant === "compact") {
    return pill;
  }

  return (
    <HoverCard openDelay={300} closeDelay={200}>
      <HoverCardTrigger asChild>{pill}</HoverCardTrigger>
      <HoverCardContent
        align="start"
        className="gencl:max-w-md! gencl:min-w-80"
      >
        <GroupHoverCard
          communityDetails={communityDetails}
          groupDetails={groupDetails}
          videoId={videoId}
          onGroupJoinStatusChange={onGroupJoinStatusChange}
          onGroupSubscriptionChange={onGroupSubscriptionChange}
        />
      </HoverCardContent>
    </HoverCard>
  );
}
