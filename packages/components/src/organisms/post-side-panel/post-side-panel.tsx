import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";

import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";

import { Comments } from "../../molecules/comments";
import { PostDetails } from "../post-details";

type PostSidePanelPropsType = ComponentProps<"div"> & {
  postDetails: PostDetailsType;
  onGroupJoinStatusChange?: ComponentProps<
    typeof PostDetails
  >["onGroupJoinStatusChange"];
  onGroupSubscriptionChange?: ComponentProps<
    typeof PostDetails
  >["onGroupSubscriptionChange"];
  onCommunityJoinStatusChange?: ComponentProps<
    typeof PostDetails
  >["onCommunityJoinStatusChange"];
};

export function PostSidePanel({
  className,
  postDetails,
  onGroupJoinStatusChange,
  onGroupSubscriptionChange,
  onCommunityJoinStatusChange,
  ...restProps
}: PostSidePanelPropsType) {
  return (
    <div
      className={cn(
        "gencl:w-full gencl:grid gencl:overflow-auto gencl:max-w-[520px] gencl:gap-4 gencl:grid-rows-[auto_minmax(300px,1fr)] gencl:pb-4",
        className
      )}
      {...restProps}
    >
      <PostDetails
        postDetails={postDetails}
        onGroupJoinStatusChange={onGroupJoinStatusChange}
        onGroupSubscriptionChange={onGroupSubscriptionChange}
        onCommunityJoinStatusChange={onCommunityJoinStatusChange}
      />
      <Comments
        videoId={postDetails.video.id}
        loopId={postDetails.group.id}
        communityId={postDetails.community.id}
        videoSlug={postDetails.video.slug}
        className="gencl:overflow-auto"
      />
    </div>
  );
}
