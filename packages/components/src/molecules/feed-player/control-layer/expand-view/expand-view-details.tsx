import { ReadMore } from "@genuin/ui/read-more";
import { Avatar } from "@genuin/ui/avatar";
import { PostDetailsType } from "src/react-query/api/feed/schema";
import { ComponentProps } from "react";
import { cn } from "@genuin/ui/utils";

type ExpandViewProps = ComponentProps<"div"> & {
  postDetails: PostDetailsType;
};

export function ExpandViewDetails({
  className,
  postDetails,
  ...restProps
}: ExpandViewProps) {
  return (
    <div
      className={cn(
        "gencl:absolute gencl:w-full gencl:z-10 gencl:right-0-0 gencl:bottom-0 gencl:p-4",
        "gencl:bg-gradient-to-b gencl:from-[#11111100] gencl:to-[#111111b3]",
        className
      )}
      {...restProps}
    >
      <div className="gencl:flex gencl:space-y-3 gencl:gap-2 gencl:items-center gencl:text-white gencl:text-body-0-semi-bold">
        <Avatar
          imageUrl={postDetails.owner.profileImage}
          alt={postDetails.owner.name ?? ""}
          isAvatar={postDetails.owner.isAvatar}
        />
        {postDetails.owner.brand ? (
          <a href={postDetails.owner.brand.slug}>
            @{postDetails.owner.userName}
          </a>
        ) : (
          <a href={postDetails.owner.userName}>@{postDetails.owner.userName}</a>
        )}
      </div>
      <ReadMore
        showExpandText={false}
        text={postDetails.video.description}
        maxLines={2}
        shouldAnimate
        className="gencl:text-white! gencl:text-body-1-medium"
      />
      <div>Add community/group pills here.</div>
      <div className={cn("", className)} />
    </div>
  );
}
