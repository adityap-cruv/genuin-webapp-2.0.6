import { ReadMore } from "@genuin/ui/read-more";
import { cn } from "@genuin/ui/utils";
import { type ComponentProps } from "react";

import type { PostDetailsType } from "src/react-query/api/feed/schema";

import { CommunityDetails } from "./community-details";
import { OwnerInfo } from "./owner-info";

export type DetailsPropsType = ComponentProps<"div"> & {
  postDetails: PostDetailsType;
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
          className={cn("gencl:text-body-1-medium gencl:pt-3")}
        />
      )}
      <CommunityDetails communityDetails={community} groupDetails={group} />
    </div>
  );
}
