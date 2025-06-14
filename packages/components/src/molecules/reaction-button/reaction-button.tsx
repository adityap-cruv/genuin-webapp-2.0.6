import { useAuthContext } from "@genuin/components/context/auth";
import { Button as PrimitiveButton } from "@genuin/ui/button";
import { toastError } from "@genuin/ui/components/toaster";
import { AuthenticationModal } from "@genuin/components/organisms/authentication-modal";
import { useVideoReationMutation } from "@genuin/components/react-query/api/feed/spark";
import { ComponentProps, useCallback } from "react";
import { DynamicReactionIcon } from "./dynamic-reaction-icon";

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
  contentType: "VIDEO" | "COMMENT";
  /**
   * Whether to render the button children or not.
   */
  withCustomChildren?: boolean;
  onReactionStateChange?: (isReacted: boolean) => void;
};

export function ReactionButton(props: ReactionButtonProps) {
  const { authenticationStatus } = useAuthContext();
  const button = <Button {...props} />;

  if (authenticationStatus === "unauthenticated") {
    return <AuthenticationModal asChild>{button}</AuthenticationModal>;
  }

  return button;
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
  const { mutate: reactToVideo, isPending } = useVideoReationMutation({
    onSuccess: (isReacted) => {
      onReactionStateChange?.(isReacted);
    },
    onError: (error) => {
      toastError("Failed to react to video. Please try again later.");
      console.error("Failed to react to video:", error);
    },
  });

  const handleOnClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(e);
      if (!user) {
        return; // If user is not authenticated, do nothing
      }
      reactToVideo({ contentId, type: contentType, reaction: !isReacted });
    },
    [onClick, reactToVideo, contentId, contentType, isReacted, user]
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
        variant="dark"
        isSparked={isReacted}
        showSparkCount={true}
        iconHeight={24}
        iconWidth={24}
        sparkCount={reactionCount}
      />
    </PrimitiveButton>
  );
}
