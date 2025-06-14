import { Button as PrimitiveButton } from "@genuin/ui/button";
import { NotificationIcon } from "@genuin/ui/icons";
import { useAuthContext } from "@genuin/components/context/auth";
import { AuthenticationModal } from "@genuin/components/organisms/authentication-modal";
import { ComponentProps, useCallback } from "react";
import { useSubscribeGroupMutation } from "@genuin/components/react-query/api/group/subscribe";
import { toastError } from "@genuin/ui/components/toaster";
import { Loader } from "@genuin/ui/components/loader";

type GroupSubscriptionButtonProps = {
  groupId: string;
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
    return <AuthenticationModal asChild>{button}</AuthenticationModal>;
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
      toastError("Failed to subscribe to group. Please try again later.");
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
      shape={shape === "pill" ? "pill" : undefined}
      onClick={handleClick}
      disabled={isPending || disabled}
      {...restProps}
    >
      {isPending ? (
        <Loader strokeColor="black" size="sm" />
      ) : isSubscriber ? (
        "S"
      ) : (
        <NotificationIcon />
      )}
      {showText && (isPending ? " Loading..." : " Notify Me")}
    </PrimitiveButton>
  );
}
