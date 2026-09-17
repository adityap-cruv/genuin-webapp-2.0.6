import { cn } from "@genuin/ui/lib/utils";
import type { ComponentProps, MouseEvent } from "react";

import type { FloatingVideoTrigger } from "@genuin/components/lib/floating-video/types";
import { CommunityPill } from "@genuin/components/molecules/feed-player/pills/community-pill";
import { GroupPill } from "@genuin/components/molecules/feed-player/pills/group-pill";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

type PillsPropsType = {
  variant?: ComponentProps<typeof CommunityPill>["variant"];
  communityDetails: PostDetailsType["community"];
  groupDetails: PostDetailsType["group"];
  videoId?: string;
  onGroupJoinStatusChange?: ComponentProps<typeof GroupPill>["onGroupJoinStatusChange"];
  onGroupSubscriptionChange?: ComponentProps<typeof GroupPill>["onGroupSubscriptionChange"];
  onCommunityJoinStatusChange?: ComponentProps<typeof CommunityPill>["onCommunityJoinStatusChange"];
  isHoverable?: boolean;
  hideCommunityJoinButton?: boolean;
  hideGroupSubscriptionButton?: boolean;
  hideGroupPill?: boolean;
  hideCommunityPill?: boolean;
  /**
   * Called when one of the pills is about to navigate to its own page, tagged with which
   * pill it was. Join and subscribe buttons stop propagation, so they never reach it.
   */
  onPillNavigate?: (trigger: FloatingVideoTrigger, href: string, event: MouseEvent<HTMLElement>) => void;
} & ComponentProps<"div">;

export function Pills({
  communityDetails,
  groupDetails,
  variant,
  videoId,
  onGroupJoinStatusChange,
  onGroupSubscriptionChange,
  onCommunityJoinStatusChange,
  className,
  isHoverable = false,
  hideCommunityJoinButton,
  hideGroupSubscriptionButton,
  hideGroupPill,
  hideCommunityPill,
  onPillNavigate,
  ...restProps
}: PillsPropsType) {
  return (
    <div className={cn("gencl:flex gencl:gap-2", className)} {...restProps}>
      {!hideCommunityPill && communityDetails && (
        <CommunityPill
          isHoverable={isHoverable}
          variant={variant}
          videoId={videoId}
          onCommunityJoinStatusChange={onCommunityJoinStatusChange}
          communityDetails={communityDetails}
          hideCommunityJoinButton={hideCommunityJoinButton}
          onNavigate={onPillNavigate ? (href, event) => onPillNavigate("community", href, event) : undefined}
        />
      )}
      {!hideGroupPill && groupDetails && (
        <GroupPill
          isHoverable={isHoverable}
          variant={variant}
          videoId={videoId}
          groupDetails={groupDetails}
          communityDetails={communityDetails}
          onGroupJoinStatusChange={onGroupJoinStatusChange}
          onGroupSubscriptionChange={onGroupSubscriptionChange}
          hideGroupSubscriptionButton={hideGroupSubscriptionButton}
          onNavigate={onPillNavigate ? (href, event) => onPillNavigate("group", href, event) : undefined}
        />
      )}
    </div>
  );
}
