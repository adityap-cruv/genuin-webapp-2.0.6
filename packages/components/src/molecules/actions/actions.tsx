import {
  CommentIcon,
  RepostIcon,
  ShareIcon,
  ThreeDotsIcon,
} from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import { type ComponentProps, type ReactNode } from "react";
import { Menu } from "./menu";
import { ReactionButton } from "@genuin/components/molecules/reaction-button";
import { DynamicReactionIcon } from "@genuin/components/molecules/reaction-button";
import { ShareButton } from "@genuin/components/molecules/share-button";
import { RepostModal } from "@genuin/components/organisms/repost-modal/repost-modal";
import { useAuthContext } from "@genuin/components/context/auth";
import { AuthenticationModal } from "@genuin/components/organisms/authentication-modal";
import { TooltipAction } from "./tooltip";
import { cva, VariantProps } from "class-variance-authority";
import { useBaseContext } from "@genuin/components/context/base";

type ActionType = "REPOST" | "REACTION" | "COMMENT" | "SHARE" | "MORE";

// Define a new type for the context object
type ActionWrapperContextType = {
  contentId: string;
  isReacted: boolean;
  reactionCount: number;
  shareUrl: string;
  slug: string;
  groupSlug: string;
  variant?: VariantProps<typeof actionVariants>["theme"];
  onReactionStateChange?: (isReacted: boolean) => void;
};

const actionVariants = cva("", {
  variants: {
    theme: {
      dark: "",
      light: "",
    },
    variant: {
      mobile: "",
    },
  },
  defaultVariants: {
    theme: "light",
    variant: undefined,
  },
});

type ActionsPropsType = ComponentProps<"div"> & {
  isReacted: boolean;
  reactionCount: number;
  onReactionStateChange?: (isReacted: boolean) => void;
  contentId: string;
  shareUrl: string;
  slug: string;
  groupSlug: string;
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
} & VariantProps<typeof actionVariants>;

// Default wrappers for each action type
const defaultActionWrappers: Record<
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
      reactionButtonTheme={context.variant}
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
      groupSlug={context.groupSlug}
      children={node}
    />
  ),
};

export function Actions({
  className,
  theme = "light",
  variant,
  isReacted,
  actionWrapper,
  reactionCount,
  contentId,
  shareUrl,
  groupSlug,
  onReactionStateChange,
  slug,
  isCommentBoxOpen = false,
  onClick,
  ...restProps
}: ActionsPropsType) {
  const { tooltip } = useBaseContext().brandDetails.reactions;
  const actions = [
    {
      icon: <RepostIcon theme={theme} />, // fallback to light for mobile
      actionType: "REPOST",
      tooltipText: "Repost",
    },
    {
      icon: (
        <DynamicReactionIcon
          isSparked={isReacted}
          sparkCount={reactionCount}
          theme={theme}
        />
      ),
      actionType: "REACTION",
      tooltipText: tooltip,
    },
    {
      icon: <CommentIcon theme={theme} />,
      actionType: "COMMENT",
      tooltipText: "Add a comment",
    },
    {
      icon: <ShareIcon theme={theme} />,
      actionType: "SHARE",
      tooltipText: "Share",
    },
    {
      icon: <ThreeDotsIcon theme={theme} />,
      actionType: "MORE",
      tooltipText: "More",
    },
  ] as const;

  return (
    <div
      className={cn(
        "gencl:space-y-4 gencl:flex gencl:flex-col gencl:justify-end gencl:[&_svg]:size-8 gencl:[&_img]:size-8!",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      {...restProps}
    >
      {actions.map((action, index) => {
        const context = {
          contentId,
          isReacted,
          onReactionStateChange,
          reactionCount,
          shareUrl,
          slug,
          groupSlug,
          variant:
            (variant === "mobile" ? "dark" : theme) ?? ("light" as const),
        };
        // For mobile variant, render icon directly without TooltipAction
        if (variant === "mobile") {
          if (actionWrapper?.[action.actionType]) {
            return actionWrapper[action.actionType]!(action.icon, context);
          }
          return defaultActionWrappers[action.actionType](action.icon, context);
        }

        const defaultNode = (
          <TooltipAction
            key={`action-${index}`}
            icon={action.icon}
            tooltipText={action.tooltipText}
            variant={theme}
            className={
              action.actionType === "COMMENT" && isCommentBoxOpen
                ? theme === "dark"
                  ? "gencl:bg-secondary-800"
                  : "gencl:bg-secondary-50 gencl:border-secondary-50"
                : ""
            }
            disableTooltip={action.actionType === "COMMENT" && isCommentBoxOpen}
          />
        );
        if (actionWrapper?.[action.actionType]) {
          return actionWrapper[action.actionType]!(defaultNode, context);
        }
        return defaultActionWrappers[action.actionType](defaultNode, context);
      })}
    </div>
  );
}
