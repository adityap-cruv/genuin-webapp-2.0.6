import { Button, type ButtonPropsType } from "@genuin/ui/button";
import { NotificationIcon } from "@genuin/ui/icons";

type GroupSubscriptionButtonProps = {
  onNotificationStatusChange?: () => void;
  showText?: boolean;
} & ButtonPropsType;

export function GroupSubscriptionButton({
  showText = false,
  onNotificationStatusChange,
  ...rest
}: GroupSubscriptionButtonProps) {
  return (
    <Button
      size="md"
      theme="secondary"
      {...rest}
      onClick={() => onNotificationStatusChange?.()}
    >
      <NotificationIcon
        className={rest.shape === "pill" ? "gencl:h-3.5" : ""}
      />
      {showText && "Notify Me"}
    </Button>
  );
}
