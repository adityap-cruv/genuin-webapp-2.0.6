import React, { ComponentProps, useCallback, Suspense, lazy } from "react";
const AuthenticationModal = lazy(() =>
  import("../../organisms/authentication-modal").then((m) => ({
    default: m.AuthenticationModal,
  }))
);
import { useSubscribeGroupMutation } from "@genuin/components/react-query/api/group/subscribe";
import { Toast } from "@genuin/ui/components/toaster";
import { Loader } from "@genuin/ui/components/loader";
import { cn } from "@genuin/ui/lib/utils";
import { useAnalytics } from "@genuin/components/context/analytics";
import { Button as PrimitiveButton } from "@genuin/ui/button";
import { NotificationEnabledIcon, NotificationIcon } from "@genuin/ui/icons";
import { useAuthContext } from "@genuin/components/context/auth";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { createReturnQueryParams } from "@genuin/components/lib/utils/return-query";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { Link } from "../link";
import { useRouter } from "@genuin/components/hooks/use-router";
import { setQueryDataForGroupSubscriptionChangeInFeed } from "@genuin/components/react-query/api/feed";
import { getPartialQueryKeyForFeed } from "@genuin/components/react-query/keys/feed";

type GroupSubscriptionButtonProps = {
  groupId: string;
  groupName: string;
  groupDescription: string;
  groupSlug: string;
  shareUrl: string;
  showText?: boolean;
  isSubscriber: boolean;
  videoId?: string;
  onSubscriptionChange?: (isSubscriber: boolean) => void;
} & ComponentProps<typeof PrimitiveButton>;

export function GroupSubscriptionButton({
  ...restProps
}: GroupSubscriptionButtonProps) {
  const { authenticationStatus, handleAuthCallback } = useAuthContext();
  const { modalConfig } = useEmbedConfigs();

  const button = <Button {...restProps} />;

  if (authenticationStatus === "unauthenticated") {
    const groupUrl = buildPageUrl({
      type: "group",
      slug: restProps.groupSlug,
    });

    const clickHandler = handleAuthCallback({
      authCallbackData: {
        action: "subscribe-group",
        path: groupUrl,
        returnQueryParams: createReturnQueryParams({
          url: groupUrl,
          action: "subscribe-group",
        }),
      },
      pendingActionData: {
        action: "subscribe-group",
        groupId: restProps.groupId,
      },
    });

    if (clickHandler) {
      return <span onClick={clickHandler}>{button}</span>;
    }

    if (modalConfig.hideModal) {
      return (
        <Link href={groupUrl} target="_blank">
          {button}
        </Link>
      );
    }

    return (
      <Suspense fallback={null}>
        <AuthenticationModal
          getAppData={{
            data: {
              type: "subscribe",
              payload: {
                ldDescription: restProps.groupDescription,
                groupName: restProps.groupName,
                shareUrl: restProps.shareUrl,
              },
            },
          }}
          asChild
        >
          {button}
        </AuthenticationModal>
      </Suspense>
    );
  }

  return button;
}

// TODO: configure notification on button icon here.
function Button({
  showText,
  groupId,
  shape,
  isSubscriber,
  disabled,
  groupName,
  groupDescription,
  shareUrl,
  groupSlug,
  onClick,
  onSubscriptionChange,
  ...restProps
}: GroupSubscriptionButtonProps) {
  const { user } = useAuthContext();
  const { track, EventName } = useAnalytics();
  const router = useRouter();
  const { mutate: subscribeGroup, isPending } = useSubscribeGroupMutation({
    onSuccess(isSubscriber) {
      onSubscriptionChange?.(isSubscriber);

      // Emit SDK event for group subscription change
      setQueryDataForGroupSubscriptionChangeInFeed({
        queryKey: getPartialQueryKeyForFeed(),
        groupId,
        isSubscribed: isSubscriber,
      });

      // Track loop subscription events
      if (isSubscriber) {
        track(EventName.LOOP_SUBSCRIBED, {
          content_id: groupId,
          slug: groupSlug,
          group_id: groupId,
          group_name: groupName,
          ...(restProps.videoId && { video_id: restProps.videoId }),
        });
        Toast.Success({
          message: "Notifications have been turned on",
          description: `You will be notified of all updates for the group ${groupName}`,
        });
      } else {
        track(EventName.LOOP_UNSUBSCRIBED, {
          content_id: groupId,
          slug: groupSlug,
          group_id: groupId,
          group_name: groupName,
          ...(restProps.videoId && { video_id: restProps.videoId }),
        });
      }
    },
    onError: (error) => {
      Toast.Error({
        message: "Failed to subscribe to group. Please try again later.",
      });
    },
  });

  const handleClick = useCallback(
    (e: any) => {
      onClick?.(e);

      track(EventName.SUBSCRIPTION_CLICKED, {
        group_id: groupId,
        group_name: groupName,
        is_subscribed: isSubscriber,
      });

      if (!user) return;
      subscribeGroup({ chatId: groupId, subscribe: !isSubscriber });
    },
    [groupId, isSubscriber, subscribeGroup, user]
  );

  return (
    <PrimitiveButton
      size="md"
      theme="secondary"
      variant={showText ? "default" : "icon"}
      shape={shape === "pill" ? "pill" : undefined}
      onClick={handleClick}
      className={cn(shape === "pill" && "gencl:p-0")}
      disabled={isPending || disabled}
      {...restProps}
    >
      {isPending ? (
        <Loader strokeColor="black" size={shape === "pill" ? "xs" : "sm"} />
      ) : isSubscriber ? (
        <NotificationEnabledIcon
          className={cn(shape === "pill" && "gencl:size-4")}
          variant="light"
        />
      ) : (
        <NotificationIcon className={cn(shape === "pill" && "gencl:size-4")} />
      )}
      {showText && !isSubscriber && (isPending ? " Loading..." : " Notify Me")}
    </PrimitiveButton>
  );
}
