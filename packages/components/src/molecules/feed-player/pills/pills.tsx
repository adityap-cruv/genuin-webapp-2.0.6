import { cn } from "@genuin/ui/lib/utils";
import { CommunityPill } from "@genuin/components/molecules/feed-player/pills/community-pill";
import { GroupPill } from "@genuin/components/molecules/feed-player/pills/group-pill";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { ComponentProps } from "react";

type PillsPropsType = {
  variant?: ComponentProps<typeof CommunityPill>["variant"];
  communityDetails: PostDetailsType["community"];
  groupDetails: PostDetailsType["group"];
  onGroupJoinStatusChange?: ComponentProps<
    typeof GroupPill
  >["onGroupJoinStatusChange"];
  onGroupSubscriptionChange?: ComponentProps<
    typeof GroupPill
  >["onGroupSubscriptionChange"];
  onCommunityJoinStatusChange?: ComponentProps<
    typeof CommunityPill
  >["onCommunityJoinStatusChange"];
} & ComponentProps<"div">;

export function Pills({
  communityDetails,
  groupDetails,
  variant,
  onGroupJoinStatusChange,
  onGroupSubscriptionChange,
  onCommunityJoinStatusChange,
  className,
  ...restProps
}: PillsPropsType) {
  return (
    <div
      className={cn("gencl:pt-3 gencl:flex gencl:gap-2", className)}
      {...restProps}
    >
      <CommunityPill
        isHoverable={true}
        variant={variant}
        onCommunityJoinStatusChange={onCommunityJoinStatusChange}
        communityDetails={communityDetails}
      />
      <GroupPill
        isHoverable={true}
        variant={variant}
        groupDetails={groupDetails}
        communityDetails={communityDetails}
        onGroupJoinStatusChange={onGroupJoinStatusChange}
        onGroupSubscriptionChange={onGroupSubscriptionChange}
      />
    </div>
  );
}
