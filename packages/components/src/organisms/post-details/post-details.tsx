"use client";
import { cn, getTimeAgo } from "@genuin/ui/utils";
import { type ComponentProps } from "react";

import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { Pills } from "@genuin/components/molecules/feed-player/pills/pills";
import { ReadMore } from "@genuin/components/molecules/read-more";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

import { OwnerInfo } from "./owner-info";

export type DetailsPropsType = ComponentProps<"div"> & {
  postDetails: PostDetailsType;
  onGroupJoinStatusChange?: ComponentProps<typeof Pills>["onGroupJoinStatusChange"];
  onGroupSubscriptionChange?: ComponentProps<typeof Pills>["onGroupSubscriptionChange"];
  onCommunityJoinStatusChange?: ComponentProps<typeof Pills>["onCommunityJoinStatusChange"];
};

/**
 * This component is used to display the details of a post.
 * It mainly contains the details of owner/community/loop.
 *
 * Create more flavour around this component for mobile view and full screen view.
 * @param param0
 * @returns
 */
export function PostDetails({
  postDetails: { community, owner, video, group },
  className,
  onGroupJoinStatusChange,
  onGroupSubscriptionChange,
  onCommunityJoinStatusChange,
  ...restProps
}: DetailsPropsType) {
  const { community: communityConfig } = useEmbedConfigs();

  if (!video) return null;

  return (
    <div
      className={cn("gencl:border gencl:w-full gencl:border-secondary-150 gencl:p-4 gencl:rounded-2xl", className)}
      {...restProps}>
      <OwnerInfo owner={owner} createdAt={video.createdAt != null ? getTimeAgo(video.createdAt) : ""} />
      {video.description && (
        <ReadMore
          text={video.description}
          maxLines={2}
          textClassName={cn("gencl:text-body-1-medium")}
          className="gencl:pt-3"
        />
      )}
      <Pills
        communityDetails={community}
        groupDetails={group}
        videoId={video.id}
        onCommunityJoinStatusChange={onCommunityJoinStatusChange}
        onGroupJoinStatusChange={onGroupJoinStatusChange}
        onGroupSubscriptionChange={onGroupSubscriptionChange}
        hideCommunityJoinButton={!communityConfig.showJoinCommunityButton}
        isHoverable
        className="gencl:pt-3"
      />
    </div>
  );
}
