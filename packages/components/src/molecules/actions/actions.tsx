import { CommentIcon, LinkIcon, RepostIcon, ShareIcon, ThreeDotsIcon } from "@genuin/ui/icons";
import { cn } from "@genuin/ui/utils";
import type { VariantProps } from "class-variance-authority";
import { cva } from "class-variance-authority";
import { type ComponentProps, type ReactNode, cloneElement, isValidElement, useMemo } from "react";
import { lazy } from "react";

import { useAnalytics, VideoTypes } from "@genuin/components/context/analytics";
import { useAuthContext } from "@genuin/components/context/auth";
import { useBaseContext } from "@genuin/components/context/base";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { createReturnQueryParams } from "@genuin/components/lib/utils/return-query";
import { OctoActionIcon } from "@genuin/components/molecules/octo-action-icon";
import { SafeSuspense } from "@genuin/components/molecules/error/safe-suspense";
import { DynamicReactionIcon } from "@genuin/components/molecules/reaction-button";
import { ReactionButton } from "@genuin/components/molecules/reaction-button";
import { ShareButton } from "@genuin/components/molecules/share-button";

import { Link } from "../link";

import { ActionPopover } from "./action-popover";
import { TooltipAction } from "./tooltip";

const Menu = lazy(() => import("./menu").then((m) => ({ default: m.Menu })));

const AuthenticationModal = lazy(() =>
  import("@genuin/components/organisms/authentication-modal").then((m) => ({
    default: m.AuthenticationModal,
  }))
);

const RepostModal = lazy(() =>
  import("@genuin/components/organisms/repost-modal/repost-modal").then((m) => ({ default: m.RepostModal }))
);

type ActionType = "REPOST" | "REACTION" | "COMMENT" | "SHARE" | "LINKOUT" | "MORE" | "OCTO";

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
  videoType?: VideoTypes;
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
  onReactionStateChange?: ComponentProps<typeof ReactionButton>["onReactionStateChange"];
  contentId: string;
  shareUrl: string;
  slug: string;
  groupSlug: string;
  isCommentBoxOpen?: boolean;
  /** Thumbnail image from the first available linkout link. Shows a square preview instead of LinkIcon. */
  linkoutThumbnail?: string | null;
  videoType?: VideoTypes;
  /** Whether to show the linkout icon. Defaults to true. */
  showLinkout?: boolean;
  isLinkoutsOpen?: boolean;
  actionWrapper?: Partial<Record<ActionType, (defaultNode: ReactNode, context: ActionWrapperContextType) => ReactNode>>;
} & VariantProps<typeof actionVariants>;

// Default wrappers for each action type
const defaultActionWrappers: Record<
  ActionType,
  (defaultNode: ReactNode, context: ActionWrapperContextType) => ReactNode
> = {
  OCTO: (node) => node,
  LINKOUT: (node) => node,
  REPOST: (node, _context) => {
    const { authenticationStatus, handleAuthCallback } = useAuthContext();
    const embedDetails = useSafeEmbedContext();
    const authInfo = embedDetails?.embedData.authInfo;
    const { brandDetails } = useBaseContext();
    const {
      modalConfig,
      view: { brandLayoutType },
    } = useEmbedConfigs();

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
      pendingActionData: {
        action: "repost",
        videoSlug: _context.slug,
        videoId: brandLayoutType === "ted" ? _context.slug : _context.contentId,
        embedId: embedDetails?.embedData.embed_id,
      },
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
        <ActionPopover content="to repost this Short." params={returnQueryParams} onPopOverClick={clickHandler}>
          <div onClick={handleRepostClick}>{node}</div>
        </ActionPopover>
      );
    }

    if (authenticationStatus === "unauthenticated") {
      if (clickHandler) {
        return (
          <div
            onClick={() => {
              clickHandler();
            }}>
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
        <SafeSuspense fallback={node} errorFallback={null}>
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
            asChild>
            <div onClick={handleRepostClick}>{node}</div>
          </AuthenticationModal>
        </SafeSuspense>
      );
    }

    return (
      <SafeSuspense fallback={node} errorFallback={null}>
        <RepostModal
          key="repost-modal"
          videoId={_context.contentId}
          videoType={_context.videoType ?? VideoTypes.Content}
          asChild>
          <div onClick={handleRepostClick}>{node}</div>
        </RepostModal>
      </SafeSuspense>
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
        reactionButtonTheme={context.variant}
        showReactionCount
        videoType={context.videoType ?? VideoTypes.Content}
        withCustomChildren
        asChild>
        {node}
      </ReactionButton>
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
        video_type: _context.videoType,
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
        video_type: _context.videoType,
      });
    };

    return (
      <ShareButton key="share-button" pathName={_context.shareUrl} withCustomChildren onClick={handleShareClick}>
        {node}
      </ShareButton>
    );
  },
  MORE: (node, context) => {
    return (
      <SafeSuspense fallback={node} errorFallback={null}>
        <Menu
          key="actions-more-menu"
          contentId={context.contentId}
          shareUrl={context.shareUrl}
          videoSlug={context.slug}
          groupSlug={context.groupSlug}
          videoType={context.videoType ?? VideoTypes.Content}>
          {node}
        </Menu>
      </SafeSuspense>
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
  videoType,
  isLinkoutsOpen = false,
  linkoutThumbnail,
  showLinkout = false,
  onClick,
  ...restProps
}: ActionsPropsType) {
  const baseContext = useBaseContext();
  const tooltip = baseContext?.brandDetails?.reactions?.tooltip ?? "Spark";
  const { engagement } = useEmbedConfigs();

  const {
    engagementTools: { octo, comment, repost, share, spark },
    showEngagementTools,
  } = engagement;

  // Only include actions if enabled in engagementTools config
  // If showEngagementTools is false, only show the MORE action
  const actions = [
    // OCTO ACTION - Appears first (at the top)
    showEngagementTools && octo
      ? {
          icon: <OctoActionIcon size={32} />,
          actionType: "OCTO" as const,
          tooltipText: "Octo",
        }
      : null,
    showLinkout
      ? {
          icon: linkoutThumbnail ? (
            <img
              src={linkoutThumbnail}
              alt="link"
              className="gencl:size-8 gencl:rounded-sm gencl:object-cover gencl:shrink-0"
            />
          ) : (
            <LinkIcon variant={theme === "dark" ? "light" : "dark"} />
          ),
          actionType: "LINKOUT" as const,
          tooltipText: "Linkouts",
        }
      : null,
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
              type={theme === "light" ? "comment" : "feed"}
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
        "gencl:gap-4 gencl:flex gencl:flex-col gencl:justify-end gencl:[&_svg]:size-8 gencl:[&_img]:size-8! gencl:z-10",
        className
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      {...restProps}>
      {actions.map((action, index) => {
        const context = {
          contentId,
          isReacted,
          onReactionStateChange,
          reactionCount,
          shareUrl,
          slug,
          groupSlug,
          variant: (variant === "mobile" ? "dark" : theme) ?? ("light" as const),
          videoType,
        };

        // Use action type as key for better stability (action types are unique)
        const key = `action-${action.actionType}`;
        const isOctoAction = action.actionType === "OCTO";

        // Clone Octo icon with size="100%" for both mobile and desktop
        const iconElement =
          isOctoAction && isValidElement<{ size?: number | string; className?: string }>(action.icon)
            ? cloneElement(action.icon, {
                size: "100%",
                className: cn("gencl:h-full gencl:w-full", action.icon.props.className),
              })
            : action.icon;

        // For mobile variant, render icon directly (Octo gets circular treatment)
        if (variant === "mobile") {
          const mobileNode = (
            <div className="gencl:flex gencl:h-12 gencl:w-12 gencl:items-center gencl:justify-center">
              {iconElement}
            </div>
          );

          if (actionWrapper?.[action.actionType]) {
            return <div key={key}>{actionWrapper[action.actionType]!(mobileNode, context)}</div>;
          }
          return <div key={key}>{defaultActionWrappers[action.actionType](mobileNode, context)}</div>;
        }

        const isCommentActionOpen = action.actionType === "COMMENT" && isCommentBoxOpen;
        const defaultNode = (
          <TooltipAction
            icon={iconElement}
            tooltipText={action.tooltipText}
            variant={theme}
            iconSize={isOctoAction ? "fill" : "default"}
            className={cn(
              isCommentActionOpen || (action.actionType === "LINKOUT" && isLinkoutsOpen)
                ? theme === "dark"
                  ? "gencl:bg-secondary-800"
                  : "gencl:bg-secondary-50 gencl:border-secondary-50"
                : undefined
              // isOctoAction
              //   ? "gencl:bg-transparent gencl:hover:bg-transparent gencl:border-0 gencl:shadow-none"
              //   : undefined
            )}
            disableTooltip={isCommentActionOpen || (action.actionType === "LINKOUT" && isLinkoutsOpen)}
          />
        );
        if (actionWrapper?.[action.actionType]) {
          return <div key={key}>{actionWrapper[action.actionType]!(defaultNode, context)}</div>;
        }
        return <div key={key}>{defaultActionWrappers[action.actionType](defaultNode, context)}</div>;
      })}
    </div>
  );
}
