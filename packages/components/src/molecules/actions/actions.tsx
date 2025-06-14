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
import { ReactionButton } from "@molecules/reaction-button";
import { DynamicReactionIcon } from "@molecules/reaction-button";
import { ShareButton } from "@molecules/share-button";
import { RepostModal } from "@organisms/repost-modal/repost-modal";

const tooltipVariants = cva("", {
  variants: {
    variant: {
      light:
        "gencl:border-secondary-200 gencl:border gencl:hover:bg-secondary-200 ",
      dark: "gencl:bg-secondary-900 gencl:hover:bg-secondary-800",
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
} & VariantProps<typeof tooltipVariants>;

function TooltipAction({
  icon,
  tooltipText,
  variant,
  onClick,
}: TooltipActionProps) {
  return (
    <Tooltip>
      <TooltipTrigger
        className={cn(
          tooltipVariants({ variant }),
          "gencl:hover:cursor-pointer ",
          "gencl:h-12 gencl:w-12 gencl:flex gencl:items-center gencl:justify-center  gencl:rounded-full",
          "gencl:[&_svg]:w-8 gencl:[&_svg]:h-8"
        )}
        onClick={onClick}
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
  onReactionStateChange?: (isReacted: boolean) => void;
};

type ActionsPropsType = ComponentProps<"div"> & {
  isReacted: boolean;
  reactionCount: number;
  onReactionStateChange?: (isReacted: boolean) => void;
  contentId: string;
  variant?: "light" | "dark";
  shareUrl: string;
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
  REPOST: (node, _context) => (
    <RepostModal videoId={_context.contentId} asChild>
      {node}
    </RepostModal>
  ),
  REACTION: (node, context) => (
    <ReactionButton
      isReacted={context.isReacted}
      contentId={context.contentId}
      reactionCount={context.reactionCount}
      contentType="VIDEO"
      onReactionStateChange={context.onReactionStateChange}
      children={node}
      withCustomChildren
    />
  ),
  COMMENT: (node, _context) => node,
  SHARE: (node, _context) => (
    <ShareButton pathName={_context.shareUrl} withCustomChildren>
      {node}
    </ShareButton>
  ),
  MORE: (node, context) => (
    <Menu contentId={context.contentId} children={node} />
  ),
};

export function Actions({
  className,
  variant = "light",
  isReacted,
  actionWrapper,
  reactionCount,
  contentId, // Added contentId here
  shareUrl,
  onReactionStateChange, // Added onReactionStateChange here
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
          />
        );
        // Create context object
        const context = {
          contentId,
          isReacted,
          onReactionStateChange,
          reactionCount,
          shareUrl,
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
