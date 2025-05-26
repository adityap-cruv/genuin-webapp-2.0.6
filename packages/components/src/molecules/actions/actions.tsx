import {
  CommentIcon,
  RepostIcon,
  ShareIcon,
  SparkIcon,
  ThreeDotsIcon,
} from "@genuin/ui/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@genuin/ui/tooltip";
import { cn } from "@genuin/ui/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import type { ComponentProps, ReactNode } from "react";

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

type ActionsPropsType = ComponentProps<"div"> & {
  onReactionStateChange?: (isReacted: boolean) => void;
  variant?: "light" | "dark";
  /**
   * If you want to override the default action wrappers, you can pass a namedActionWrapper object.
   * Each key in the object should correspond to an action type (e.g., "REPOST", "REACTION", etc.),
   */
  actionWrapper?: Partial<
    Record<ActionType, (defaultNode: ReactNode) => ReactNode>
  >;
};

// Default wrappers for each action type (identity by default)
export const defaultActionWrappers: Record<
  ActionType,
  (defaultNode: ReactNode) => ReactNode
> = {
  REPOST: (node) => node,
  REACTION: (node) => node,
  COMMENT: (node) => node,
  SHARE: (node) => node,
  MORE: (node) => node,
};

export function Actions({
  className,
  variant = "light",
  actionWrapper,
  ...restProps
}: ActionsPropsType) {
  const actions = [
    {
      icon: <RepostIcon variant={variant} />,
      actionType: "REPOST",
      tooltipText: "Repost",
    },
    {
      icon: <SparkIcon variant={variant} />,
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
        // Priority: namedActionWrapper > defaultActionWrappers
        if (actionWrapper?.[action.actionType]) {
          return actionWrapper[action.actionType]!(defaultNode);
        }
        return defaultActionWrappers[action.actionType](defaultNode);
      })}
    </div>
  );
}
