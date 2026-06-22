"use client";
import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";
import { lazy } from "react";

import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

const Comments = lazy(() =>
  import("@genuin/components/molecules/comments/comments").then((m) => ({
    default: m.Comments,
  }))
) as React.ComponentType<any>;

import { PostDetails } from "../post-details/post-details";

type PostSidePanelPropsType = ComponentProps<"div"> & {
  postDetails: PostDetailsType;
  onGroupJoinStatusChange?: ComponentProps<typeof PostDetails>["onGroupJoinStatusChange"];
  onGroupSubscriptionChange?: ComponentProps<typeof PostDetails>["onGroupSubscriptionChange"];
  onCommunityJoinStatusChange?: ComponentProps<typeof PostDetails>["onCommunityJoinStatusChange"];
  /**
   * @param videoId - The video id
   * @param increment - true to increment, false to decrement
   */
  onCommentCountChange?: (videoId: string, increment?: boolean) => void;
};

export function PostSidePanel({
  className,
  postDetails,
  onGroupJoinStatusChange,
  onGroupSubscriptionChange,
  onCommunityJoinStatusChange,
  onCommentCountChange,
  ...restProps
}: PostSidePanelPropsType) {
  const { video } = postDetails;

  if (!video) return null;

  return (
    <div
      className={cn(
        "gencl:w-full gencl:grid gencl:overflow-auto gencl:max-w-[520px] gencl:gap-4 gencl:grid-rows-[auto_minmax(300px,1fr)] gencl:pb-4",
        className
      )}
      {...restProps}>
      <PostDetails
        postDetails={postDetails}
        onGroupJoinStatusChange={onGroupJoinStatusChange}
        onGroupSubscriptionChange={onGroupSubscriptionChange}
        onCommunityJoinStatusChange={onCommunityJoinStatusChange}
      />
      <SafeSuspense fallback={null}>
        <Comments
          videoId={video.id}
          loopId={postDetails.group?.id}
          communityId={postDetails.community?.id}
          shareUrl={video.shareUrl}
          videoSlug={video.slug}
          className="gencl:overflow-auto"
          onCommentCountChange={onCommentCountChange}
        />
      </SafeSuspense>
    </div>
  );
}
