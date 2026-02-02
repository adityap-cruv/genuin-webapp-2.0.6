"use client";
import { cn } from "@genuin/ui/lib/utils";
import { IHeartCheckIcon, IHeartPlusIcon } from "@genuin/ui/icons";
import { type ComponentProps, useMemo, useState, useEffect } from "react";
import { PostDetailsType } from "@genuin/components/react-query/api/feed/schema";
import {
  SDKEventEmitter,
  SDKEventName,
} from "@genuin/components/lib/sdk-event-emitter";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import {
  getFollowButtonTexts,
  type ContentType,
  type WebsiteType,
} from "@genuin/components/lib/utils/iheart-text-utils";
import { useAuthContext } from "@genuin/components/context/auth";
import { createReturnQueryParams } from "@genuin/components/lib/utils/return-query";

interface IHeartFollowButtonProps extends ComponentProps<"button"> {
  size?: "xs" | "sm" | "md";
  websiteType: WebsiteType;
  attributes?: PostDetailsType["video"]["attributes"];
  shareUrl?: string;
  videoSlug?: string;
  videoId?: string;
}

export function IHeartFollowButton({
  size = "sm",
  className,
  websiteType,
  attributes,
  shareUrl,
  videoSlug,
  videoId,
  ...props
}: IHeartFollowButtonProps) {
  const embedDetails = useSafeEmbedContext();
  const { authenticationStatus, handleAuthCallback } = useAuthContext();
  const type = attributes?.type as ContentType;
  const followId =
    type === "station" ? attributes?.station_id : attributes?.podcast_id;

  // Get initial follow status from embed context
  const initialFollowStatus = useMemo(() => {
    if (!followId || !embedDetails?.getFollowStatus) return false;
    return embedDetails.getFollowStatus(String(followId), type) ?? false;
  }, [followId, type, embedDetails?.getFollowStatus]);

  // Local state that updates from event bus
  const [isFollowing, setIsFollowing] = useState(initialFollowStatus);

  // Check if follow status exists and trigger CHECK_FOLLOWING_STATUS if not
  useEffect(() => {
    if (
      !followId ||
      !type ||
      !embedDetails?.getFollowStatus ||
      authenticationStatus === "unauthenticated"
    )
      return;

    const currentFollowStatus = embedDetails.getFollowStatus(
      String(followId),
      type
    );

    // If follow status is undefined (not found), trigger CHECK_FOLLOWING_STATUS event
    if (currentFollowStatus === undefined) {
      SDKEventEmitter.emit(SDKEventName.CHECK_FOLLOWING_STATUS, {
        id: followId,
        type: type as "podcast" | "station",
      });
    }
  }, [followId, type, embedDetails?.getFollowStatus, authenticationStatus]);

  // Listen to follow status changes from event bus
  useEffect(() => {
    if (!embedDetails?.embedEventBus) return;

    const handleFollowStatusChange = () => {
      if (followId && embedDetails?.getFollowStatus) {
        const currentStatus = embedDetails.getFollowStatus(
          String(followId),
          type
        );
        if (currentStatus !== undefined) {
          setIsFollowing(currentStatus);
        }
      }
    };

    // Listen for follow status changes
    embedDetails.embedEventBus.on(
      "followStatusChange",
      handleFollowStatusChange
    );

    return () => {
      embedDetails.embedEventBus.off(
        "followStatusChange",
        handleFollowStatusChange
      );
    };
  }, [
    followId,
    type,
    embedDetails?.embedEventBus,
    embedDetails?.getFollowStatus,
  ]);

  // Update local state when initial status changes
  useEffect(() => {
    setIsFollowing(initialFollowStatus);
  }, [initialFollowStatus]);

  // Auto follow logic - similar to reaction button auto spark
  useEffect(() => {
    if (!embedDetails || !followId || !type) return;

    const action = embedDetails.embedData.autoUserInteractionToPerform;
    const autoInteractionActionDone =
      embedDetails.embedEventBus.getContext().autoInteractionActionDone;

    // Check if this is an auto follow action for this specific follow target
    const shouldAutoFollow =
      action === "iheart-follow" &&
      embedDetails.embedData.followId === String(followId) &&
      embedDetails.embedData.followType === type;

    // Don't perform auto action if already done, already following, or not authenticated
    if (
      autoInteractionActionDone ||
      isFollowing ||
      !shouldAutoFollow ||
      authenticationStatus === "unauthenticated"
    ) {
      return;
    }

    // Mark auto interaction as done to prevent repeated actions
    embedDetails.markAutoInteractionActionDone();

    // Perform the auto follow action
    const newFollowingState = true; // Auto follow always sets to following

    // Update embed context follow status
    if (embedDetails.updateFollowStatus) {
      embedDetails.updateFollowStatus(
        String(followId),
        type,
        newFollowingState
      );
    }

    // Emit SDK follow change event
    SDKEventEmitter.emit(SDKEventName.ON_FOLLOW_CHANGED, {
      isFollowed: newFollowingState,
      id: followId,
      type: type as "podcast" | "station",
      name: attributes?.title ?? "",
    });
  }, [embedDetails, followId, type, isFollowing, authenticationStatus]);

  // Compute CTA text using utility function
  const ctaTexts = useMemo(
    () => getFollowButtonTexts(websiteType, type),
    [websiteType, type]
  );

  const displayText = isFollowing
    ? ctaTexts.followingText
    : ctaTexts.defaultText;

  // Create return query params for authentication callbacks
  const returnQueryParams = useMemo(
    () =>
      createReturnQueryParams({
        url: shareUrl,
        action: "iheart-follow",
        additionalParams: {
          followId: followId ? String(followId) : undefined,
          followType: type,
        },
      }),
    [shareUrl, followId, type]
  );

  // Setup authentication callback handler
  const clickHandler = handleAuthCallback({
    authCallbackData: {
      path: "/",
      action: "iheart-follow",
      returnQueryParams,
    },
    urlToOpen: shareUrl,
    pendingActionData: {
      action: "iheart-follow",
      followId: followId ? String(followId) : undefined,
      followType: type,
      embedId: embedDetails?.embedData.embed_id,
      videoSlug: videoSlug,
      videoId: videoId,
    },
  });

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    // If not authenticated and we have a click handler, use it for external auth
    if (authenticationStatus === "unauthenticated" && clickHandler) {
      clickHandler();
      return;
    }

    const newFollowingState = !isFollowing;

    // Update embed context follow status if followId is available
    if (followId && type && embedDetails?.updateFollowStatus) {
      embedDetails.updateFollowStatus(
        String(followId),
        type,
        newFollowingState
      );
    }

    // Emit SDK follow change event if followId is available
    if (followId && type) {
      SDKEventEmitter.emit(SDKEventName.ON_FOLLOW_CHANGED, {
        isFollowed: newFollowingState,
        id: followId,
        type: type as "podcast" | "station",
        name: attributes?.title ?? "",
      });
    }

    // Call external onClick handler if provided
    if (props.onClick) {
      props.onClick(e);
    }
  };

  return (
    <button
      type="button"
      {...props}
      onClick={handleClick}
      aria-label={displayText}
      aria-pressed={isFollowing}
      tabIndex={0}
      className={cn(
        "gencl:w-fit gencl:border gencl:rounded-full gencl:flex gencl:items-center gencl:justify-center gencl:cursor-pointer gencl:gap-1 gencl:py-1.5 gencl:px-4",
        // Enhanced transitions for smooth state changes
        "gencl:transition-all gencl:duration-300 gencl:ease-in-out gencl:h-8!",
        !isFollowing
          ? "gencl:border-white gencl:bg-transparent hover:gencl:bg-white/10"
          : "gencl:border-transparent gencl:bg-white hover:gencl:bg-gray-100",
        className
      )}
    >
      <div className="gencl:transition-transform gencl:duration-200 gencl:ease-out hover:gencl:rotate-12">
        {isFollowing ? (
          <IHeartCheckIcon
            theme={!isFollowing ? "dark" : "light"}
            size={size}
            aria-hidden="true"
          />
        ) : (
          <IHeartPlusIcon
            theme={!isFollowing ? "dark" : "light"}
            size={size}
            aria-hidden="true"
          />
        )}
      </div>
      <span
        className={cn(
          "gencl:text-[14px]! gencl:leading-[16px]! gencl:font-semibold gencl:tracking-[-0.2px]!",
          // Smooth text color transition
          "gencl:transition-colors gencl:duration-300 gencl:ease-in-out",
          !isFollowing ? "gencl:text-white" : "gencl:text-black"
        )}
      >
        {displayText}
      </span>
    </button>
  );
}
