"use client";
import { useAuthContext } from "@genuin/components/context/auth";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { Button as PrimitiveButton } from "@genuin/ui/button";
import { Toast } from "@genuin/ui/components/toaster";
import { AuthenticationModal } from "@genuin/components/organisms/authentication-modal";
import { useVideoReationMutation } from "@genuin/components/react-query/api/feed/spark";
import React, { ComponentProps, useCallback, useEffect, useMemo } from "react";
import { DynamicReactionIcon } from "./dynamic-reaction-icon";
import { useBaseContext } from "@genuin/components/context/base";
import { cn } from "@genuin/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { createReturnQueryParams } from "@genuin/components/lib/utils/return-query";
import { Link } from "../link";
import { useAnalytics } from "@genuin/components/context/analytics";
import { ActionPopover } from "../actions/action-popover";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";

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

export const ReactionButton = React.memo(function ReactionButton({
  reactionCount,
  shareUrl,
  contentId,
  videoSlug,
  reactionButtonTheme,
  showReactionCount,
  onClick,
  videoId,
  ...restProps
}: ReactionButtonProps) {
  const { authenticationStatus, handleAuthCallback } = useAuthContext();
  const { brandDetails } = useBaseContext();
  const embedDetails = useSafeEmbedContext();
  const { modalConfig } = useEmbedConfigs();
  const authInfo = embedDetails?.embedData.authInfo;
  const brandId = brandDetails.brand_id;

  const returnQueryParams = useMemo(
    () =>
      createReturnQueryParams({
        url: shareUrl,
        action: "spark",
        additionalParams: {
          videoSlug: videoSlug ?? undefined,
          commentId: contentId,
        },
      }),
    []
  );

  const clickHandler = handleAuthCallback({
    authCallbackData: { path: "/", action: "spark", returnQueryParams },
    urlToOpen: shareUrl,
  });

  // Create a customized button based on whether it's for the popover case or not
  const createButton = (isPopoverCase = false) => (
    <Button
      showReactionCount={showReactionCount}
      reactionCount={reactionCount}
      contentId={contentId}
      videoId={videoId}
      videoSlug={videoSlug}
      onClick={(e) => {
        // Only trigger clickHandler for the default case, not for popover
        onClick?.(e);
        if (!isPopoverCase) {
          clickHandler?.();
        }
      }}
      {...restProps}
    />
  );

  const button = createButton();
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

  // Special case for brand ID 2357, unauthenticated users with auth info
  if (
    authenticationStatus === "unauthenticated" &&
    (authInfo?.signInUrl || authInfo?.signUpUrl) &&
    brandId === 2357
  ) {
    const popoverButton = createButton(true); // Use the special button that won't trigger clickHandler

    return (
      <ActionPopover
        content={
          restProps.contentType === "COMMENT"
            ? "to like this comment."
            : "to like this Short."
        }
        children={
          <div>
            {popoverButton}
            {showReactionCount && count}
          </div>
        }
        params={returnQueryParams}
      />
    );
  }

  if (authenticationStatus === "unauthenticated" && !clickHandler) {
    if (modalConfig.hideModal && shareUrl) {
      return (
        <Link href={shareUrl} target="_blank">
          {button}
        </Link>
      );
    }
    return (
      <AuthenticationModal
        getAppData={{
          data: {
            type: "spark",
            payload: {
              reactionSuffix: brandDetails.reactions?.suffix,
              reactionTitle: brandDetails.reactions?.title,
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
});

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
  videoSlug,
  onReactionStateChange,
  ...restProps
}: ReactionButtonProps) {
  const { user } = useAuthContext();
  const { track, EventName } = useAnalytics();

  const {
    mutate: reactToVideo,
    isPending,
    isSuccess,
  } = useVideoReationMutation({
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

  // Example usage of useSafeEmbedContext
  // This will not throw if the provider is missing
  const embedContext = useSafeEmbedContext();

  const performReaction = useCallback(() => {
    if (!user || isPending) {
      return; // If user is not authenticated, do nothing
    }

    // Optimistically update the UI immediately
    const newReactionState = !isReacted;
    onReactionStateChange?.(newReactionState);

    // Make the API call
    reactToVideo({
      contentId,
      type: contentType,
      reaction: newReactionState,
    });
  }, [
    reactToVideo,
    contentId,
    contentType,
    isReacted,
    user,
    isPending,
    onReactionStateChange,
  ]);

  const handleOnClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      performReaction();
    },
    [onClick, performReaction]
  );

  useEffect(() => {
    const action = embedContext?.embedData.autoUserInteractionToPerform;
    const startVideoSlug = embedContext?.embedData.startVideoSlug;

    const autoInteractionActionDone =
      embedContext?.embedEventBus.getContext().autoInteractionActionDone;

    const shouldAutoSparkForVideo =
      action === "spark" &&
      startVideoSlug === videoSlug &&
      contentType === "VIDEO";

    const shouldAutoSparkForComment =
      action === "comment-spark" &&
      embedContext?.embedData.commentId === contentId &&
      contentType === "COMMENT";

    if (
      !embedContext ||
      autoInteractionActionDone ||
      isSuccess ||
      isPending ||
      !(shouldAutoSparkForComment || shouldAutoSparkForVideo)
    )
      return;

    embedContext.markAutoInteractionActionDone();

    // We don't need to add contentType to the dependency array
    // because it is not changing during the component's lifecycle.
    // If the embedData has autoUserInteractionToPerform set to "spark" or "comment-spark",
    // we perform the reaction automatically if the user has not reacted yet.
    if (shouldAutoSparkForVideo) {
      performReaction();
    }

    // Auto spark comment in case of commentId match
    if (shouldAutoSparkForComment) {
      performReaction();
    }
  }, [performReaction]);

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
