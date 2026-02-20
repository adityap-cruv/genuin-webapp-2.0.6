"use client";
import { Avatar } from "@genuin/ui/avatar";
import { Link } from "@genuin/components/molecules/link";
import { JoinCommunityButton } from "@genuin/components/molecules/join-community-button";
import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from "@genuin/ui/hover-card";
import { cva } from "class-variance-authority";

import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { useAuthContext } from "@genuin/components/context/auth";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { CommunityHoverCard } from "../community-hover-card";
import { ComponentProps, useEffect, useState, useRef } from "react";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { usePrevious } from "@genuin/components/hooks/use-previous";

const communityPillVariants = cva(
  "gencl:flex gencl:w-fit gencl:items-center gencl:gap-1 gencl:p-1 gencl:pr-2 gencl:rounded-full gencl:transition-all gencl:cursor-pointer",
  {
    variants: {
      variant: {
        light:
          "gencl:bg-white gencl:text-default gencl:border gencl:border-secondary-150 gencl:hover:bg-secondary-50 gencl:hover:border-secondary-50",
        dark: "gencl:bg-black/40 gencl:text-white",
        fullScreen:
          "gencl:bg-black/40 gencl:backdrop-blur-lg gencl:text-white gencl:border-none",
        compact:
          "gencl:bg-secondary-50! gencl:text-default gencl:border-none gencl:hover:bg-secondary-150!",
      },
    },
    defaultVariants: {
      variant: "light",
    },
  },
);

type CommunityPillProps = {
  isHoverable?: boolean;
  variant?: "light" | "dark" | "fullScreen" | "compact";
  communityDetails: PostDetailsType["community"];
  videoId?: string;
  className?: string;
  onCommunityJoinStatusChange?: ComponentProps<
    typeof JoinCommunityButton
  >["onCommunityJoinStatusChange"];
  hideCommunityJoinButton?: boolean;
};

export function CommunityPill({
  isHoverable = false,
  variant = "light",
  communityDetails,
  videoId,
  onCommunityJoinStatusChange,
  className,
  hideCommunityJoinButton = false,
}: CommunityPillProps) {
  const { authenticationStatus } = useAuthContext();
  const embedDetails = useSafeEmbedContext();
  // Truncate name to 24 characters for compact variant
  const displayName =
    variant === "compact" &&
    communityDetails.name &&
    communityDetails.name.length > 24
      ? `${communityDetails.name.substring(0, 24)}...`
      : communityDetails.name;

  const [localJoinStatus, setLocalJoinStatus] = useState(
    communityDetails.userRole,
  );
  const prevJoinStatus = usePrevious(communityDetails.userRole);

  /**
   * When the user successfully joins (userRole becomes 'MEMBER'),
   * keep the join button visible for 3 seconds to show the updated status/animation,
   * then hide it. For all other role changes, update immediately.
   */
  useEffect(() => {
    if (prevJoinStatus !== "MEMBER" && communityDetails.userRole === "MEMBER") {
      setLocalJoinStatus("MEMBER");
    } else {
      setLocalJoinStatus(communityDetails.userRole);
    }
  }, [communityDetails.userRole]);

  const hideButton =
    localJoinStatus === "MEMBER" || authenticationStatus === "unauthenticated";

  const pill = (
    <Link
      href={buildPageUrl({ type: "community", slug: communityDetails.slug })}
    >
      <div className={communityPillVariants({ variant, className })}>
        <div className="gencl:flex gencl:gap-1 gencl:items-center gencl:line-clamp-1 gencl:break-all">
          <Avatar
            alt={communityDetails.name ?? ""}
            imageUrl={communityDetails.profileImage ?? ""}
            isAvatar={false}
            size="xs"
          />
          <span
            className="gencl:text-body-2-medium gencl:line-clamp-1"
            style={
              embedDetails?.embedData.card_layout_id === 3
                ? { lineHeight: "18.2px" }
                : {}
            }
          >
            {displayName}
          </span>
        </div>
        {authenticationStatus === "authenticated" &&
          variant !== "compact" &&
          !hideCommunityJoinButton && (
            <div
              className={`gencl:overflow-hidden gencl:!flex gencl:shrink-0 gencl:transition-all gencl:duration-500 ${
                hideButton
                  ? "gencl:max-w-0 gencl:opacity-0 gencl:ml-0 gencl:px-0!"
                  : "gencl:max-w-24 gencl:opacity-100 gencl:ml-1"
              }`}
            >
              <JoinCommunityButton
                size="sm"
                roleTexts={{
                  UNJOINED: "Join",
                }}
                className="gencl:h-6"
                communityId={communityDetails.id}
                communityHandle={communityDetails.handle}
                communityName={communityDetails.name ?? ""}
                slug={communityDetails.slug}
                isPrivate={communityDetails.isPrivate}
                role={communityDetails.userRole}
                videoId={videoId}
                shape="pill"
                theme={
                  variant === "fullScreen"
                    ? "secondary"
                    : communityDetails.userRole === "MEMBER"
                      ? "outline"
                      : communityDetails.userRole === "REQUESTED"
                        ? "secondary"
                        : "primary"
                }
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                onCommunityJoinStatusChange={onCommunityJoinStatusChange}
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
        <CommunityHoverCard
          communityDetails={communityDetails}
          videoId={videoId}
          onCommunityJoinStatusChange={onCommunityJoinStatusChange}
        />
      </HoverCardContent>
    </HoverCard>
  );
}
