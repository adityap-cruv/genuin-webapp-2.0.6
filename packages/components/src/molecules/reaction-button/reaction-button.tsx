import { useAuthContext } from "@genuin/components/context/auth";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { Button as PrimitiveButton } from "@genuin/ui/button";
import { Toast } from "@genuin/ui/components/toaster";
import { AuthenticationModal } from "@genuin/components/organisms/authentication-modal";
import { useVideoReationMutation } from "@genuin/components/react-query/api/feed/spark";
import { ComponentProps, useCallback, useEffect, useMemo } from "react";
import { DynamicReactionIcon } from "./dynamic-reaction-icon";
import { useBaseContext } from "@genuin/components/context/base";
import { cn } from "@genuin/ui/lib/utils";
import { cva, type VariantProps } from "class-variance-authority";
import { createReturnQueryParams } from "@genuin/components/lib/utils/return-query";

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
} & VariantProps<typeof reactionButtonVariant>;

export function ReactionButton({
  reactionCount,
  shareUrl,
  contentId,
  videoSlug,
  reactionButtonTheme,
  showReactionCount,
  onClick,
  ...restProps
}: ReactionButtonProps) {
  const { authenticationStatus, handleAuthCallback } = useAuthContext();
  const { brandDetails } = useBaseContext();
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

  const button = (
    <Button
      showReactionCount={showReactionCount}
      reactionCount={reactionCount}
      contentId={contentId}
      onClick={(e) => {
        onClick?.(e);
        clickHandler?.();
      }}
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

  if (authenticationStatus === "unauthenticated" && !clickHandler) {
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
  onReactionStateChange,
  ...restProps
}: ReactionButtonProps) {
  const { user } = useAuthContext();
  const {
    mutate: reactToVideo,
    isPending,
    isSuccess,
  } = useVideoReationMutation({
    // onSuccess: (isReacted) => {},
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

    // Make the API call in the background
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
    if (!embedContext) return;
    const action = embedContext?.embedData.autoUserInteractionToPerform;
    // We don't need to add contentType to the dependency array
    // because it is not changing during the component's lifecycle.
    // If the embedData has autoUserInteractionToPerform set to "spark" or "comment-spark",
    // we perform the reaction automatically if the user has not reacted yet.
    const shouldAutoReact =
      (action === "spark" && contentType === "VIDEO") ||
      (action === "comment-spark" && contentType === "COMMENT");

    if (shouldAutoReact && !isSuccess) {
      performReaction();
    }
  }, [embedContext, performReaction, isSuccess]);

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
