import { Button as PrimitiveButton } from "@genuin/ui/button";
import { NotificationEnabledIcon, NotificationIcon } from "@genuin/ui/icons";
import { useAuthContext } from "@genuin/components/context/auth";
import { AuthenticationModal } from "@genuin/components/organisms/authentication-modal";
import { ComponentProps, useCallback } from "react";
import { useSubscribeGroupMutation } from "@genuin/components/react-query/api/group/subscribe";
import { Toast } from "@genuin/ui/components/toaster";
import { Loader } from "@genuin/ui/components/loader";
import { cn } from "@genuin/ui/lib/utils";

type GroupSubscriptionButtonProps = {
  groupId: string;
  groupName: string;
  groupDescription: string;
  shareUrl: string;
  showText?: boolean;
  isSubscriber: boolean;
  onSubscriptionChange?: (isSubscriber: boolean) => void;
} & ComponentProps<typeof PrimitiveButton>;

export function GroupSubscriptionButton({
  ...restProps
}: GroupSubscriptionButtonProps) {
  const { authenticationStatus } = useAuthContext();

  const button = <Button {...restProps} />;

  if (authenticationStatus === "unauthenticated") {
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
  onClick,
  onSubscriptionChange,
  ...restProps
}: GroupSubscriptionButtonProps) {
  const { user } = useAuthContext();
  const { mutate: subscribeGroup, isPending } = useSubscribeGroupMutation({
    onSuccess(isSubscriber) {
      onSubscriptionChange?.(isSubscriber);
    },
    onError: (error) => {
      Toast.Error({message : "Failed to subscribe to group. Please try again later."})
    },
  });

  const handleClick = useCallback(
    (e: any) => {
      onClick?.(e);
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
      disabled={isPending || disabled}
      {...restProps}
    >
      {isPending ? (
        <Loader strokeColor="black" size="sm" />
      ) : isSubscriber ? (
        <NotificationEnabledIcon variant="light" />
      ) : (
        <NotificationIcon
          className={cn(shape === "pill" && "gencl:size-3.5")}
        />
      )}
      {showText && (isPending ? " Loading..." : " Notify Me")}
    </PrimitiveButton>
  );
}
