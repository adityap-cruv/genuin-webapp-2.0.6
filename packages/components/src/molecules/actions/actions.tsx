import {
  CommentIcon,
  RepostIcon,
  ShareIcon,
  ThreeDotsIcon,
} from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import { type ComponentProps, type ReactNode, useMemo } from "react";
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
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useAnalytics } from "@genuin/components/context/analytics";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { ActionPopover } from "./action-popover";
import { createReturnQueryParams } from "@genuin/components/lib/utils/return-query";
import { Link } from "../link";

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
  onReactionStateChange?: ComponentProps<
    typeof ReactionButton
  >["onReactionStateChange"];
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
    const { authenticationStatus, handleAuthCallback } = useAuthContext();
    const embedDetails = useSafeEmbedContext();
    const authInfo = embedDetails?.embedData.authInfo;
    const { brandDetails } = useBaseContext();
    const { modalConfig } = useEmbedConfigs();
    const brandId = brandDetails.brand_id;

    // Create return query params for authentication callbacks
    const returnQueryParams = useMemo(
      () =>
        createReturnQueryParams({
          url: _context.shareUrl,
          action: "repost",
          additionalParams: {
            videoSlug: _context.slug ?? undefined,
          },
        }),
      [_context.shareUrl, _context.slug]
    );

    // Setup authentication callback handler
    const clickHandler = handleAuthCallback({
      authCallbackData: { path: "/", action: "repost", returnQueryParams },
      urlToOpen: _context.shareUrl,
    });

    // Track repost event when clicked
    const handleRepostClick = () => {};

    // Special case for brand ID 2357, unauthenticated users with auth info
    if (
      authenticationStatus === "unauthenticated" &&
      (authInfo?.signInUrl || authInfo?.signUpUrl) &&
      embedDetails?.embedData.card_layout_id === 3
    ) {
      return (
        <ActionPopover
          content="to repost this Short."
          children={<div onClick={handleRepostClick}>{node}</div>}
          params={returnQueryParams}
        />
      );
    }

    if (authenticationStatus === "unauthenticated") {
      if (clickHandler) {
        return (
          <div
            onClick={() => {
              clickHandler();
            }}
          >
            {node}
          </div>
        );
      }

      if (modalConfig.hideModal) {
        return (
          <Link href={_context.shareUrl} target="_blank">
            {node}
          </Link>
        );
      }

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
          <div onClick={handleRepostClick}>{node}</div>
        </AuthenticationModal>
      );
    }

    return (
      <RepostModal key="repost-modal" videoId={_context.contentId} asChild>
        <div onClick={handleRepostClick}>{node}</div>
      </RepostModal>
    );
  },
  REACTION: (node, context) => {
    return (
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
    );
  },
  COMMENT: (node, _context) => {
    const { track, EventName } = useAnalytics();

    // Track comment event when clicked
    const handleCommentClick = () => {
      track(EventName.VIDEO_COMMENT, {
        content_id: _context.contentId,
        content_category: "loop",
        event_record_screen: "feed",
        event_target_screen: "none",
      });
    };

    return <div onClick={handleCommentClick}>{node}</div>;
  },
  SHARE: (node, _context) => {
    const { track, EventName } = useAnalytics();

    // Track share event when clicked
    const handleShareClick = () => {
      track(EventName.VIDEO_SHARED, {
        content_id: _context.contentId,
        content_category: "loop",
        event_record_screen: "feed",
        event_target_screen: "none",
      });
    };

    return (
      <ShareButton
        key="share-button"
        pathName={_context.shareUrl}
        withCustomChildren
        onClick={handleShareClick}
      >
        {node}
      </ShareButton>
    );
  },
  MORE: (node, context) => {
    return (
      <Menu
        key="actions-more-menu"
        contentId={context.contentId}
        shareUrl={context.shareUrl}
        videoSlug={context.slug}
        groupSlug={context.groupSlug}
        children={node}
      />
    );
  },
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
  const baseContext = useBaseContext();
  const tooltip = baseContext?.brandDetails?.reactions?.tooltip ?? "Spark";
  const { engagement } = useEmbedConfigs();

  const {
    engagementTools: { comment, repost, share, spark },
    showEngagementTools,
  } = engagement;

  // Only include actions if enabled in engagementTools config
  // If showEngagementTools is false, only show the MORE action
  const actions = [
    showEngagementTools && repost
      ? {
          icon: <RepostIcon theme={theme} />, // fallback to light for mobile
          actionType: "REPOST" as const,
          tooltipText: "Repost",
        }
      : null,
    showEngagementTools && spark
      ? {
          icon: (
            <DynamicReactionIcon
              isSparked={isReacted}
              sparkCount={reactionCount}
              theme={theme}
            />
          ),
          actionType: "REACTION" as const,
          tooltipText: tooltip,
        }
      : null,
    showEngagementTools && comment
      ? {
          icon: <CommentIcon theme={theme} />,
          actionType: "COMMENT" as const,
          tooltipText: "Add a comment",
        }
      : null,
    showEngagementTools && share
      ? {
          icon: <ShareIcon theme={theme} />,
          actionType: "SHARE" as const,
          tooltipText: "Share",
        }
      : null,
    {
      icon: <ThreeDotsIcon theme={theme} />,
      actionType: "MORE" as const,
      tooltipText: "More",
    },
  ].filter(Boolean) as Array<{
    icon: ReactNode;
    actionType: ActionType;
    tooltipText: string;
  }>;

  return (
    <div
      className={cn(
        "gencl:space-y-2 gencl:flex gencl:flex-col gencl:justify-end gencl:[&_svg]:size-8 gencl:[&_img]:size-8! gencl:z-10",
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
