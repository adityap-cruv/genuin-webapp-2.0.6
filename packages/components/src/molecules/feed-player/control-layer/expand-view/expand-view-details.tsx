import { Avatar } from "@genuin/ui/avatar";
import { ReadMore } from "@genuin/ui/read-more";
import { cn } from "@genuin/ui/utils";
import type { ComponentProps } from "react";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { usePlayerContext } from "../../context";
import { ProfileLink } from "@genuin/components/molecules/profile-link";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { LinkOutContentRenderer } from "@genuin/components/organisms/linkouts/linkouts-details";
import { Pills } from "@genuin/components/molecules/feed-player/pills";

type ExpandViewProps = ComponentProps<"div"> & {
  postDetails: PostDetailsType;
  isActive: boolean;
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

export function ExpandViewDetails({
  className,
  postDetails,
  isActive,
  onGroupJoinStatusChange,
  onGroupSubscriptionChange,
  onCommunityJoinStatusChange,
  ...restProps
}: ExpandViewProps) {
  const { showSeeker } = usePlayerContext();

  return (
    <div
      className={cn(
        "gencl:absolute gencl:w-full gencl:z-10 gencl:right-0-0 gencl:bottom-0 gencl:p-4",
        "gencl:bg-gradient-to-b gencl:from-[#11111100] gencl:to-[#111111b3]",
        className
      )}
      {...restProps}
    >
      <div className="gencl:flex gencl:gap-2 gencl:items-center gencl:text-white gencl:text-body-0-semi-bold">
        <Avatar
          imageUrl={postDetails.owner.profileImage}
          alt={postDetails.owner.name ?? ""}
          isAvatar={postDetails.owner.isAvatar}
        />
        <ProfileLink
          url={buildPageUrl({
            type: !!postDetails.owner.brand ? "brand" : "profile",
            slug: postDetails.owner.userName,
          })}
          userLogoType={postDetails.owner.brand?.userLogo}
        >
          @{postDetails.owner.userName}
        </ProfileLink>
      </div>

      <LinkOutContentRenderer
        linkouts={postDetails.video.linkouts}
        linkoutId={postDetails.video.linkoutId}
        isActive={isActive}
        className="gencl:my-3"
      />

      <ReadMore
        showExpandText={false}
        text={postDetails.video.description}
        maxLines={2}
        shouldAnimate
        position="overlay"
        className="gencl:text-body-1-medium"
      />
      <Pills
        communityDetails={postDetails.community}
        groupDetails={postDetails.group}
        onGroupJoinStatusChange={onGroupJoinStatusChange}
        onGroupSubscriptionChange={onGroupSubscriptionChange}
        onCommunityJoinStatusChange={onCommunityJoinStatusChange}
        variant="fullScreen"
      />
      <div
        className={cn(
          "gencl:transition-all",
          showSeeker ? "gencl:h-4" : "gencl:h-0"
        )}
      />
    </div>
  );
}
