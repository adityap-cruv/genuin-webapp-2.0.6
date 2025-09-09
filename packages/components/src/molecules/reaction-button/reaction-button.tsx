import { useAuthContext } from "@genuin/components/context/auth";
import { Button as PrimitiveButton } from "@genuin/ui/button";
import { Toast } from "@genuin/ui/components/toaster";
import { AuthenticationModal } from "@genuin/components/organisms/authentication-modal";
import { useVideoReationMutation } from "@genuin/components/react-query/api/feed/spark";
import { ComponentProps, useCallback } from "react";
import { DynamicReactionIcon } from "./dynamic-reaction-icon";
import { useBaseContext } from "@genuin/components/context/base";
import { cn } from "@genuin/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { useAnalytics } from "@genuin/components/context/analytics";

const reactionButtonVariant = cva("", {
  variants: {
    reactionButtonTheme: {
      light: "",
      dark: "gencl:text-white!",
    },
  },
  defaultVariants: {
    reactionButtonTheme: "light",
  },
});

type ReactionButtonProps = ComponentProps<typeof PrimitiveButton> & {
  contentId: string;
  /**
   * If the user has reacted to the content.
   */
  isReacted: boolean;
  /**
   * The number of reactions the content has received.
   */
  reactionCount: number;
  shareUrl?: string;
  videoSlug?: string;
  contentType: "VIDEO" | "COMMENT";
  showReactionCount?: boolean;
  /**
   * Whether to render the button children or not.
   */
  withCustomChildren?: boolean;
  onReactionStateChange?: (isReacted: boolean) => void;
  videoId?: string;
} & VariantProps<typeof reactionButtonVariant>;

export function ReactionButton({
  reactionCount,
  shareUrl,
  videoSlug,
  reactionButtonTheme,
  showReactionCount,
  videoId,
  ...restProps
}: ReactionButtonProps) {
  const { authenticationStatus } = useAuthContext();
  const { brandDetails } = useBaseContext();
  const button = (
    <Button
      showReactionCount={showReactionCount}
      reactionCount={reactionCount}
      videoId={videoId}
      {...restProps}
    />
  );
  const count = (
    <p
      className={cn(
        "gencl:p-0 gencl:text-center gencl:text-body-2-medium",
        reactionButtonVariant({
          reactionButtonTheme,
        })
      )}
    >
      {reactionCount}
    </p>
  );

  if (authenticationStatus === "unauthenticated") {
    return (
      <AuthenticationModal
        getAppData={{
          data: {
            type: "spark",
            payload: {
              reactionSuffix: brandDetails.reactions.suffix,
              reactionTitle: brandDetails.reactions.title,
              shareUrl: shareUrl ?? "",
              videoSlug: videoSlug ?? "",
            },
          },
        }}
        asChild
      >
        <div>
          {button}
          {showReactionCount && count}
        </div>
      </AuthenticationModal>
    );
  }

  return (
    <div>
      {button}
      {showReactionCount && count}
    </div>
  );
}

function Button({
  isReacted,
  contentId,
  contentType,
  reactionCount,
  className,
  children,
  withCustomChildren = false,
  onClick,
  videoId,
  onReactionStateChange,
  ...restProps
}: ReactionButtonProps) {
  const { user } = useAuthContext();
  const { track, EventName } = useAnalytics();
  const { mutate: reactToVideo, isPending } = useVideoReationMutation({
    onSuccess: (isReacted) => {
      track(
        contentType === "COMMENT"
          ? isReacted
            ? EventName.COMMENT_SPARK
            : EventName.COMMENT_UNSPARK
          : isReacted
            ? EventName.VIDEO_SPARK
            : EventName.VIDEO_UNSPARK,
        {
          content_id: contentId,
          video_id: videoId ?? contentId,
          content_category: "loop",
          event_record_screen: "feed",
          event_target_screen: "none",
          is_reacted: isReacted,
        }
      );
    },
    onError: (error) => {
      // Revert the optimistic update on error
      onReactionStateChange?.(isReacted);
      Toast.Error({
        message: "Failed to react to video. Please try again later.",
      });
    },
  });

  const handleOnClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (!user || isPending) {
        return; // If user is not authenticated, do nothing
      }

      // Optimistically update the UI immediately
      const newReactionState = !isReacted;
      onReactionStateChange?.(newReactionState);

      // Make the API call in the background
      reactToVideo({
        contentId,
        type: contentType,
        reaction: newReactionState,
      });
    },
    [
      onClick,
      reactToVideo,
      contentId,
      contentType,
      isReacted,
      user,
      isPending,
      onReactionStateChange,
    ]
  );

  // If withCustomChildren is true, just return the children with logic attached
  if (withCustomChildren) {
    return (
      <span onClick={handleOnClick} className="gencl:cursor-pointer">
        {children}
      </span>
    );
  }

  // Otherwise, render the full button UI
  return (
    <PrimitiveButton
      disabled={isPending}
      onClick={handleOnClick}
      {...restProps}
    >
      <DynamicReactionIcon
        theme="dark"
        isSparked={isReacted}
        showSparkCount={true}
        iconHeight={24}
        iconWidth={24}
        sparkCount={reactionCount}
      />
    </PrimitiveButton>
  );
}
