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
import { ComponentProps, useState, useEffect } from "react";
import { JoinGroupButton } from "@genuin/components/molecules/join-group-button";
import { GroupIcon } from "@genuin/ui/icons";

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
      },
    },
    defaultVariants: {
      variant: "light",
    },
  }
);

type GroupPillProps = {
  isHoverable?: boolean;
  variant?: "light" | "dark" | "fullScreen";
  groupDetails: PostDetailsType["group"];
  communityDetails: PostDetailsType["community"];
  className?: string;
  onGroupJoinStatusChange: ComponentProps<
    typeof JoinGroupButton
  >["onGroupJoinStatusChange"];
  onGroupSubscriptionChange?: ComponentProps<
    typeof GroupSubscriptionButton
  >["onSubscriptionChange"];
};

export function GroupPill({
  isHoverable = false,
  variant = "light",
  groupDetails,
  communityDetails,
  onGroupJoinStatusChange,
  onGroupSubscriptionChange,
  className,
}: GroupPillProps) {
  const { authenticationStatus } = useAuthContext();
  const [showButton, setShowButton] = useState(!groupDetails.isSubscribed);
  const [isAnimating, setIsAnimating] = useState(false);

  // Reset visibility when subscription status changes to false
  useEffect(() => {
    if (!groupDetails.isSubscribed) {
      setShowButton(true);
      setIsAnimating(false);
    }
  }, [groupDetails.isSubscribed]);

  const handleGroupSubscriptionChange: ComponentProps<
    typeof GroupSubscriptionButton
  >["onSubscriptionChange"] = (isSubscribed) => {
    // Call the original handler if provided
    if (onGroupSubscriptionChange) {
      onGroupSubscriptionChange(isSubscribed);
    }

    // If user has subscribed, start the timer to hide the button
    if (isSubscribed) {
      // Give a slight delay before starting the animation
      setTimeout(() => {
        setIsAnimating(true);

        // Hide after animation completes
        setTimeout(() => {
          setShowButton(false);
        }, 500); // This should match the CSS transition duration
      }, 5000); // Show for 5 seconds before animation starts
    }
  };

  const ldDescription = `${
    groupDetails?.description ? groupDetails.description + " | " : ""
  } • Join ${groupDetails.name} to talk about it`;

  const pill = (
    <Link href={buildPageUrl({ type: "group", slug: groupDetails.slug })}>
      <div className={groupPillVariants({ variant, className })}>
        <div className="gencl:flex gencl:gap-1 gencl:items-center gencl:line-clamp-1">
          <div className="gencl:rounded-full gencl:bg-secondary-300 gencl:p-1">
            <GroupIcon theme="dark" size="sm" />
          </div>
          <span className="gencl:text-body-2-medium gencl:line-clamp-1">
            {groupDetails.name}
          </span>
        </div>
        {authenticationStatus === "authenticated" &&
          (!(groupDetails.isSubscribed ?? false) || showButton) && (
            <GroupSubscriptionButton
              className={`gencl:px-2 gencl:overflow-hidden gencl:shrink-0 gencl:transition-all gencl:duration-500 gencl:h-6 ${
                isAnimating
                  ? "gencl:max-w-0 gencl:opacity-0 gencl:ml-0"
                  : "gencl:max-w-24 gencl:opacity-100 gencl:ml-1"
              }`}
              variant="icon"
              shape="pill"
              size="sm"
              groupId={groupDetails.id}
              groupName={groupDetails.name ?? ""}
              groupDescription={ldDescription}
              shareUrl={groupDetails.shareUrl ?? ""}
              isSubscriber={groupDetails.isSubscribed ?? false}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              onSubscriptionChange={handleGroupSubscriptionChange}
            />
          )}
      </div>
    </Link>
  );

  if (!isHoverable) {
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
          onGroupJoinStatusChange={onGroupJoinStatusChange}
          onGroupSubscriptionChange={onGroupSubscriptionChange}
        />
      </HoverCardContent>
    </HoverCard>
  );
}
