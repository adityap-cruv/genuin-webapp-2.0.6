"use client";
import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";
import { lazy, Suspense, useEffect, useState } from "react";

import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { useFeedContext } from "@genuin/components/templates/feed/context";

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
  const { showExpandView } = useFeedContext();
  const [isAdPlaying, setIsAdPlaying] = useState(false);

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsAdPlaying(document.documentElement.classList.contains("gen-ad-playing"));
    });
    observer.observe(document.documentElement, { attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setIsAdPlaying(document.documentElement.classList.contains("gen-ad-playing"));
  }, [showExpandView]);

  if (!video) return null;

  return (
    <div
      className={cn(
        "gencl:w-full gencl:grid gencl:overflow-auto gencl:max-w-[520px] gencl:gap-4 gencl:grid-rows-[auto_minmax(300px,1fr)] gencl:pb-4",
        isAdPlaying && "gencl:invisible",
        className
      )}
      {...restProps}>
      <PostDetails
        postDetails={postDetails}
        onGroupJoinStatusChange={onGroupJoinStatusChange}
        onGroupSubscriptionChange={onGroupSubscriptionChange}
        onCommunityJoinStatusChange={onCommunityJoinStatusChange}
      />
      <Suspense fallback={null}>
        <Comments
          videoId={video.id}
          loopId={postDetails.group?.id}
          communityId={postDetails.community?.id}
          shareUrl={video.shareUrl}
          videoSlug={video.slug}
          className="gencl:overflow-auto"
          onCommentCountChange={onCommentCountChange}
        />
      </Suspense>
    </div>
  );
}
