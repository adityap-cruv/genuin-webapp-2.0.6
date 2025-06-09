import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";

import type { PostDetailsType } from "@react-query/api/feed/schema";

import { Comments } from "../comments";
import { PostDetails } from "../post-details";

type PostSidePanelPropsType = ComponentProps<"div"> & {
  postDetails: PostDetailsType;
};

export function PostSidePanel({
  className,
  postDetails,
  ...restProps
}: PostSidePanelPropsType) {
  return (
    <div
      className={cn(
        "gencl:w-full gencl:grid gencl:overflow-auto gencl:gap-4 gencl:grid-rows-[auto_minmax(300px,1fr)]",
        className
      )}
      {...restProps}
    >
      <PostDetails postDetails={postDetails} />
      <Comments
        videoId={postDetails.video.id}
        className="gencl:overflow-auto"
      />
    </div>
  );
}
