import {
  CommentIcon,
  RepostIcon,
  ShareIcon,
  ThreeDotsIcon,
} from "@genuin/ui/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@genuin/ui/tooltip";
import { cn } from "@genuin/ui/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { type ComponentProps, type ReactNode } from "react";
import { Menu } from "./menu";
import { ReactionButton } from "@genuin/components/molecules/reaction-button";
import { DynamicReactionIcon } from "@genuin/components/molecules/reaction-button";
import { ShareButton } from "@genuin/components/molecules/share-button";
import { RepostModal } from "@genuin/components/organisms/repost-modal/repost-modal";
import { useAuthContext } from "@genuin/components/context/auth";
import { AuthenticationModal } from "@genuin/components/organisms/authentication-modal";
import { Button } from "@genuin/ui/components/button";

const tooltipVariants = cva("", {
  variants: {
    variant: {
      light:
        "gencl:border-secondary-200 gencl:border gencl:hover:border-secondary-50 gencl:transition-all gencl:hover:bg-secondary-50",
      dark: "gencl:bg-secondary-900 gencl:hover:bg-secondary-700",
    },
  },
  defaultVariants: {
    variant: "light",
  },
});

// TooltipAction component definition
type TooltipActionProps = {
  icon: ReactNode;
  tooltipText: string;
  onClick?: () => void;
  disableTooltip?: boolean;
} & VariantProps<typeof tooltipVariants> &
  ComponentProps<typeof TooltipTrigger>;

function TooltipAction({
  icon,
  tooltipText,
  variant,
  onClick,
  className,
  disableTooltip = false,
  ...restProps
}: TooltipActionProps) {
  if (disableTooltip) {
    return (
      <Button
        theme={"custom"}
        className={cn(
          tooltipVariants({ variant }),
          "gencl:hover:cursor-pointer ",
          "gencl:h-12 gencl:p-0 gencl:w-12 gencl:flex gencl:items-center gencl:justify-center gencl:rounded-full",
          "gencl:[&_svg]:w-8 gencl:[&_svg]:h-8",
          className
        )}
        onClick={onClick}
        {...restProps}
      >
        {icon}
      </Button>
    );
  }
  return (
    <Tooltip>
      <TooltipTrigger
        className={cn(
          tooltipVariants({ variant }),
          "gencl:hover:cursor-pointer",
          "gencl:h-12 gencl:w-12 gencl:flex gencl:items-center gencl:justify-center  gencl:rounded-full",
          "gencl:[&_svg]:w-8 gencl:[&_svg]:h-8",
          className
        )}
        onClick={onClick}
        {...restProps}
      >
        {icon}
      </TooltipTrigger>
      <TooltipContent theme={variant ?? "light"} side="right">
        <p>{tooltipText}</p>
      </TooltipContent>
    </Tooltip>
  );
}

type ActionType = "REPOST" | "REACTION" | "COMMENT" | "SHARE" | "MORE";

// Define a new type for the context object
type ActionWrapperContextType = {
  contentId: string;
  isReacted: boolean;
  reactionCount: number;
  shareUrl: string;
  slug: string;
  variant?: "light" | "dark";
  onReactionStateChange?: (isReacted: boolean) => void;
};

type ActionsPropsType = ComponentProps<"div"> & {
  isReacted: boolean;
  reactionCount: number;
  onReactionStateChange?: (isReacted: boolean) => void;
  contentId: string;
  variant?: "light" | "dark";
  shareUrl: string;
  slug: string;
  isCommentBoxOpen?: boolean;
  /**
   * If you want to override the default action wrappers, you can pass a namedActionWrapper object.
   * Each key in the object should correspond to an action type (e.g., "REPOST", "REACTION", etc.),
   */
  actionWrapper?: Partial<
    Record<
      ActionType,
      (defaultNode: ReactNode, context: ActionWrapperContextType) => ReactNode
    >
  >;
};

// Default wrappers for each action type
export const defaultActionWrappers: Record<
  ActionType,
  (defaultNode: ReactNode, context: ActionWrapperContextType) => ReactNode
> = {
  REPOST: (node, _context) => {
    const { authenticationStatus } = useAuthContext();

    if (authenticationStatus === "unauthenticated") {
      return (
        <AuthenticationModal
          key="authentication-modal"
          getAppData={{
            data: {
              type: "repost",
              payload: {
                shareUrl: _context.shareUrl,
                videoSlug: _context.slug,
              },
            },
          }}
          asChild
        >
          {node}
        </AuthenticationModal>
      );
    }

    return (
      <RepostModal key="repost-modal" videoId={_context.contentId} asChild>
        {node}
      </RepostModal>
    );
  },
  REACTION: (node, context) => (
    <ReactionButton
      key="reaction-button"
      shareUrl={context.shareUrl}
      videoSlug={context.slug}
      isReacted={context.isReacted}
      contentId={context.contentId}
      reactionCount={context.reactionCount}
      contentType="VIDEO"
      onReactionStateChange={context.onReactionStateChange}
      children={node}
      actionButtonVariant={context.variant}
      showReactionCount
      withCustomChildren
      asChild
    />
  ),
  COMMENT: (node, _context) => node,
  SHARE: (node, _context) => (
    <ShareButton
      key="share-button"
      pathName={_context.shareUrl}
      withCustomChildren
    >
      {node}
    </ShareButton>
  ),
  MORE: (node, context) => (
    <Menu
      key="actions-more-menu"
      contentId={context.contentId}
      shareUrl={context.shareUrl}
      videoSlug={context.slug}
      children={node}
    />
  ),
};

export function Actions({
  className,
  variant = "light",
  isReacted,
  actionWrapper,
  reactionCount,
  contentId,
  shareUrl,
  onReactionStateChange,
  slug,
  isCommentBoxOpen = false,
  ...restProps
}: ActionsPropsType) {
  const actions = [
    {
      icon: <RepostIcon variant={variant} />,
      actionType: "REPOST",
      tooltipText: "Repost",
    },
    {
      icon: (
        <DynamicReactionIcon
          isSparked={isReacted}
          sparkCount={reactionCount}
          variant={variant}
        />
      ),
      actionType: "REACTION",
      tooltipText: "I find this insightful",
    },
    {
      icon: <CommentIcon variant={variant} />,
      actionType: "COMMENT",
      tooltipText: "Add a comment",
    },
    {
      icon: <ShareIcon variant={variant} />,
      actionType: "SHARE",
      tooltipText: "Share",
    },
    {
      icon: <ThreeDotsIcon variant={variant} />,
      actionType: "MORE",
      tooltipText: "More",
    },
  ] as const;

  return (
    <div
      className={cn(
        "gencl:space-y-4 gencl:flex gencl:flex-col gencl:justify-end",
        className
      )}
      {...restProps}
    >
      {actions.map((action, index) => {
        const defaultNode = (
          <TooltipAction
            key={`action-${index}`}
            icon={action.icon}
            tooltipText={action.tooltipText}
            variant={variant}
            className={
              action.actionType === "COMMENT" && isCommentBoxOpen
                ? variant === "dark"
                  ? "gencl:bg-secondary-800"
                  : "gencl:bg-secondary-50 gencl:border-secondary-50"
                : ""
            }
            disableTooltip={action.actionType === "COMMENT" && isCommentBoxOpen}
          />
        );
        // Create context object
        const context = {
          contentId,
          isReacted,
          onReactionStateChange,
          reactionCount,
          shareUrl,
          slug,
          variant,
        };
        // Priority: namedActionWrapper > defaultActionWrappers
        if (actionWrapper?.[action.actionType]) {
          return actionWrapper[action.actionType]!(defaultNode, context);
        }
        return defaultActionWrappers[action.actionType](defaultNode, context);
      })}
    </div>
  );
}
