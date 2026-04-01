import type { ComponentProps } from "react";
import type { Pills } from "@genuin/components/molecules/feed-player/pills";
import type { CommentsDialog } from "@genuin/components/molecules/comments";

/**
 * Callback types used by expand-view components
 */
export type ExpandViewCallbacks = {
  onReactionStateChange?: (
    videoId: string,
    videoSlug: string,
    isReacted: boolean,
  ) => void;
  onGroupJoinStatusChange?: ComponentProps<
    typeof Pills
  >["onGroupJoinStatusChange"];
  onGroupSubscriptionChange?: ComponentProps<
    typeof Pills
  >["onGroupSubscriptionChange"];
  onCommunityJoinStatusChange?: ComponentProps<
    typeof Pills
  >["onCommunityJoinStatusChange"];
  onCommentCountChange?: ComponentProps<
    typeof CommentsDialog
  >["onCommentCountChange"];
};
