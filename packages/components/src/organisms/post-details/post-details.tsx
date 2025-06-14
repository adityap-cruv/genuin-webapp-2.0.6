import { ReadMore } from "@genuin/ui/read-more";
import { cn } from "@genuin/ui/utils";
import { type ComponentProps } from "react";

import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

import { Pills } from "@genuin/components/molecules/feed-player/pills/pills";
import { OwnerInfo } from "./owner-info";

export type DetailsPropsType = ComponentProps<"div"> & {
  postDetails: PostDetailsType;
  onGroupJoinStatusChange?: ComponentProps<
    typeof Pills
  >["onGroupJoinStatusChange"];
  onGroupSubscriptionChange?: ComponentProps<
    typeof Pills
  >["onGroupSubscriptionChange"];
  onCommunityJoinStatusChange?: ComponentProps<
    typeof Pills
  >["onCommunityJoinStatusChange"];
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
  return (
    <div
      className={cn(
        "gencl:border gencl:border-secondary-200 gencl:p-4 gencl:rounded-2xl",
        className
      )}
      {...restProps}
    >
      <OwnerInfo owner={owner} />
      {video.description && (
        <ReadMore
          text={video.description ?? null}
          textClassName={cn("gencl:text-body-1-medium")}
          className="gencl:pt-3"
        />
      )}
      <Pills
        communityDetails={community}
        groupDetails={group}
        onCommunityJoinStatusChange={onCommunityJoinStatusChange}
        onGroupJoinStatusChange={onGroupJoinStatusChange}
        onGroupSubscriptionChange={onGroupSubscriptionChange}
      />
    </div>
  );
}
