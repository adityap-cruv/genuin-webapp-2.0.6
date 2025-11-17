import { Button as PrimitiveButton } from "@genuin/ui/button";
import { NotificationEnabledIcon, NotificationIcon } from "@genuin/ui/icons";
import { useAuthContext } from "@genuin/components/context/auth";
import { AuthenticationModal } from "@genuin/components/organisms/authentication-modal";
import { ComponentProps, useCallback } from "react";
import { useSubscribeGroupMutation } from "@genuin/components/react-query/api/group/subscribe";
import { Toast } from "@genuin/ui/components/toaster";
import { Loader } from "@genuin/ui/components/loader";
import { cn } from "@genuin/ui/lib/utils";
import { useAnalytics } from "@genuin/components/context/analytics";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { createReturnQueryParams } from "@genuin/components/lib/utils/return-query";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { Link } from "../link";

type GroupSubscriptionButtonProps = {
  groupId: string;
  groupName: string;
  groupDescription: string;
  groupSlug: string;
  shareUrl: string;
  showText?: boolean;
  isSubscriber: boolean;
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
  const { mutate: subscribeGroup, isPending } = useSubscribeGroupMutation({
    onSuccess(isSubscriber) {
      onSubscriptionChange?.(isSubscriber);
      // Track subscription event
      track(EventName.SUBSCRIPTION_CLICKED, {
        group_id: groupId,
        group_name: groupName,
        is_subscribed: isSubscriber,
      });

      if (isSubscriber)
        Toast.Success({
          message: "Notifications have been turned on",
          description: `You will be notified of all updates for the group ${groupName}`,
        });
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
