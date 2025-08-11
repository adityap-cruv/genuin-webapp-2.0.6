"use client";
import { Avatar } from "@genuin/ui/avatar";
import { ReadMore } from "@genuin/ui/read-more";
import { cn, getFormattedDuration, getMonthYear } from "@genuin/ui/utils";
import { useMemo, type ComponentProps, type ReactNode } from "react";
import type { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import { usePlayerContext } from "../../context";
import { ProfileLink } from "@genuin/components/molecules/profile-link";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { Linkouts } from "@genuin/components/organisms/linkouts";
import { Pills } from "@genuin/components/molecules/feed-player/pills";
import { Actions } from "@genuin/components/molecules/actions";
import { CommentsDialog } from "@genuin/components/molecules/comments";
import { controlLayerVariant } from "../control-layer";
import { VariantProps, cva } from "class-variance-authority";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";

/**
 * Card Layout Types
 * Define the different card layout variants used in the app
 */
export enum CardLayoutType {
  DEFAULT = 1, // Default card layout
  IHEART = 2, // iHeart specific layout
  // Add other layout types as needed
}

/**
 * Card layout variant definition
 */
const cardLayoutVariant = cva("", {
  variants: {
    layout: {
      1: "", // Default layout (CardLayoutType.DEFAULT)
      2: "", // iHeart layout (CardLayoutType.IHEART)
      // Add other layout variants as needed
    },
  },
  defaultVariants: {
    layout: 1,
  },
});

/**
 * Default layout user profile display component
 */
function DefaultUserProfile({ owner }: { owner: PostDetailsType["owner"] }) {
  return (
    <ProfileLink
      url={buildPageUrl({
        type: !!owner.brand ? "brand" : "profile",
        slug: !!owner.brand ? owner.brand.slug : owner.userName,
      })}
      userLogoType={owner.brand?.userLogo}
    >
      @{owner.userName}
    </ProfileLink>
  );
}

/**
 * iHeart layout user profile display component
 */
function IHeartUserProfile({ owner }: { owner: PostDetailsType["owner"] }) {
  return (
    <div>
      <p className="gencl:text-body-2-semi-bold gencl:line-clamp-1">
        {owner.name}
      </p>
      <p className="gencl:text-body-2-normal gencl:line-clamp-2">{owner.bio}</p>
    </div>
  );
}

/**
 * Default layout description display component
 */
function DefaultDescription({ description }: { description: any }) {
  return (
    <ReadMore
      showExpandText={false}
      text={description}
      maxLines={2}
      shouldAnimate
      position="overlay"
      className="gencl:text-body-1-medium"
    />
  );
}

/**
 * iHeart layout description display component
 */
function IHeartDescription({ video }: { video: PostDetailsType["video"] }) {
  return (
    <div>
      <p className="gencl:text-white gencl:text-body-2-semi-bold gencl:font-normal">
        {getMonthYear(video.attributes?.timestamp ?? video.createdAt ?? 0)} •{" "}
        {getFormattedDuration(String(video.duration ?? ""))}
      </p>
      <ReadMore
        showExpandText={false}
        text={video.description ?? ""}
        maxLines={2}
        shouldAnimate
        position="overlay"
        textClassName="gencl:text-body-2-normal"
      />
    </div>
  );
}

type ExpandViewProps = ComponentProps<"div"> & {
  postDetails: PostDetailsType;
  isActive: boolean;
  onReactionStateChange?: (videoId: string, isReacted: boolean) => void;
  onGroupJoinStatusChange?: ComponentProps<
    typeof Pills
  >["onGroupJoinStatusChange"];
  onGroupSubscriptionChange?: ComponentProps<
    typeof Pills
  >["onGroupSubscriptionChange"];
  onCommunityJoinStatusChange?: ComponentProps<
    typeof Pills
  >["onCommunityJoinStatusChange"];
} & VariantProps<typeof controlLayerVariant> &
  VariantProps<typeof cardLayoutVariant>;

export function ExpandViewDetails({
  className,
  postDetails,
  isActive,
  onGroupJoinStatusChange,
  onGroupSubscriptionChange,
  onCommunityJoinStatusChange,
  onReactionStateChange,
  variant,
  layout,
  ...restProps
}: ExpandViewProps) {
  const { showSeeker } = usePlayerContext();
  const embedDetails = useSafeEmbedContext();

  const defaultOpenCommentDialog = useMemo(() => {
    return (
      embedDetails?.embedData.autoUserInteractionToPerform ===
        "comment-spark" &&
      embedDetails.embedData.startVideoSlug === postDetails.video.slug
    );
  }, [embedDetails, postDetails]);

  // Determine the card layout based on postDetails or provided layout prop
  // Use the layout prop if provided, otherwise use the cardLayoutId from postDetails
  // Cast to appropriate type for the variant system (1 or 2)
  const cardLayoutId = (layout ||
    postDetails.video.cardLayoutId ||
    CardLayoutType.DEFAULT) as 1 | 2;

  return (
    <div
      className={cn(
        "gencl:absolute gencl:gap-2 gencl:w-full gencl:z-20 gencl:right-0 gencl:bottom-0 gencl:p-4",
        "gencl:bg-gradient-to-b gencl:from-[#11111100] gencl:to-[#111111b3]",
        cardLayoutVariant({ layout: cardLayoutId }),
        className
      )}
      {...restProps}
    >
      <div className="gencl:flex gencl:w-full gencl:gap-4 gencl:justify-between gencl:items-end">
        <div
          className="gencl:flex gencl:flex-col gencl:gap-4 gencl:sm:gap-2 gencl:w-5/6 gencl:sm:w-full gencl:transition-all"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="gencl:flex gencl:gap-2 gencl:items-center gencl:text-white gencl:text-body-0-semi-bold">
            <Avatar
              imageUrl={postDetails.owner.profileImage}
              alt={postDetails.owner.name ?? ""}
              isAvatar={postDetails.owner.isAvatar}
            />
            {cardLayoutId === CardLayoutType.IHEART ? (
              <IHeartUserProfile owner={postDetails.owner} />
            ) : (
              <DefaultUserProfile owner={postDetails.owner} />
            )}
          </div>

          <Linkouts
            linkouts={postDetails.video.linkouts}
            linkoutId={postDetails.video.linkoutId}
            isActive={isActive}
            cardVariant={layout === 2 ? "primary" : "default"}
            className="gencl:w-full"
          />

          {cardLayoutId === CardLayoutType.IHEART ? (
            <IHeartDescription video={postDetails.video} />
          ) : (
            <DefaultDescription description={postDetails.video.description} />
          )}
        </div>
        <Actions
          onClick={(e) => e.stopPropagation()}
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
                  shareUrl={postDetails.video.shareUrl}
                  communityId={postDetails.community.id}
                  loopId={postDetails.group.id}
                  videoId={postDetails.video.id}
                  videoSlug={postDetails.video.slug}
                  commentCount={postDetails.video.commentCount}
                  defaultOpen={defaultOpenCommentDialog}
                >
                  {defaultNode}
                </CommentsDialog>
              );
            },
          }}
          onReactionStateChange={(isReacted) => {
            onReactionStateChange?.(postDetails.video.id, isReacted);
          }}
        />
      </div>
      <div
        className="gencl:w-full gencl:overflow-x-auto gencl:scrollbar-none"
        onClick={(e) => e.stopPropagation()}
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
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
