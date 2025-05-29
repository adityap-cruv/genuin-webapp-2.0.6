import { Button, type ButtonPropsType } from "@genuin/ui/button";
import { NotificationIcon } from "@genuin/ui/icons";

type GroupNotificationButtonProps = {
  onNotificationStatusChange?: () => void;
} & ButtonPropsType;

export function GroupNotificationButton({
  onNotificationStatusChange,
  ...rest
}: GroupNotificationButtonProps) {
  return (
    <Button
      size="sm"
      theme="secondary"
      {...rest}
      onClick={() => onNotificationStatusChange?.()}
    >
      <NotificationIcon
        className={rest.shape === "pill" ? "gencl:h-3.5" : ""}
      />
    </Button>
  );
}
