import { Avatar } from "@genuin/ui/avatar";
import { ReadMore } from "@genuin/ui/read-more";
import { cn } from "@genuin/ui/utils";
import type { ComponentProps, ReactNode } from "react";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { usePlayerContext } from "../../context";
import { ProfileLink } from "@genuin/components/molecules/profile-link";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { LinkOutContentRenderer } from "@genuin/components/organisms/linkouts/linkouts-details";
import { Pills } from "@genuin/components/molecules/feed-player/pills";
import { Actions } from "@genuin/components/molecules/actions";
import { CommentsDialog } from "@genuin/components/molecules/comments";

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
        "gencl:absolute gencl:gap-2 gencl:w-full gencl:z-20 gencl:right-0 gencl:bottom-0 gencl:p-4",
        "gencl:bg-gradient-to-b gencl:from-[#11111100] gencl:to-[#111111b3]",
        className
      )}
      onClick={(e) => e.stopPropagation()}
      {...restProps}
    >
      <div className="gencl:flex gencl:gap-4 gencl:items-end">
        <div className="gencl:flex gencl:flex-col gencl:gap-2 gencl:w-full gencl:transition-all">
          <div className="gencl:flex gencl:gap-2 gencl:items-center gencl:text-white gencl:text-body-0-semi-bold">
            <Avatar
              imageUrl={postDetails.owner.profileImage}
              alt={postDetails.owner.name ?? ""}
              isAvatar={postDetails.owner.isAvatar}
            />
            <ProfileLink
              url={buildPageUrl({
                type: !!postDetails.owner.brand ? "brand" : "profile",
                slug: !!postDetails.owner.brand
                  ? postDetails.owner.brand.slug
                  : postDetails.owner.userName,
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
            className="gencl:w-full"
          />

          <ReadMore
            showExpandText={false}
            text={postDetails.video.description}
            maxLines={2}
            shouldAnimate
            position="overlay"
            className="gencl:text-body-1-medium"
          />
        </div>
        <Actions
          className="gencl:sm:hidden!"
          variant="mobile"
          theme="dark"
          contentId={postDetails.video.id}
          isReacted={postDetails.video.isSparked ?? false}
          reactionCount={postDetails.video.sparkCount}
          shareUrl={postDetails.video.shareUrl}
          slug={postDetails.video.slug}
          groupSlug={postDetails.group.slug}
          actionWrapper={{
            COMMENT: (defaultNode) => {
              return (
                <CommentsDialog
                  communityId={postDetails.community.id}
                  loopId={postDetails.group.id}
                  videoId={postDetails.video.id}
                  videoSlug={postDetails.video.slug}
                  commentCount={postDetails.video.commentCount}
                >
                  {defaultNode}
                </CommentsDialog>
              );
            },
          }}
        />
      </div>
      <div
        className="gencl:w-full gencl:overflow-x-auto gencl:scrollbar-none"
        style={{
          scrollBehavior: "smooth",
          maskImage:
            "linear-gradient(to right, transparent, black 2%, black 98%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 2%, black 98%, transparent)",
        }}
      >
        <Pills
          communityDetails={postDetails.community}
          groupDetails={postDetails.group}
          onGroupJoinStatusChange={onGroupJoinStatusChange}
          onGroupSubscriptionChange={onGroupSubscriptionChange}
          onCommunityJoinStatusChange={onCommunityJoinStatusChange}
          variant="fullScreen"
          className="gencl:min-w-max gencl:pt-3"
        />
      </div>
      <div
        className={cn(
          "gencl:h-0 gencl:transition-all",
          showSeeker && "gencl:h-4"
        )}
      />
    </div>
  );
}
