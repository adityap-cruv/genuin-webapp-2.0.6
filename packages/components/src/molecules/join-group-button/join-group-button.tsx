import { Button, type ButtonPropsType } from "@genuin/ui/button";

type JoinGroupButtonProps = {
  onGroupJoinStatusChange?: () => void;
  buttonText?: string;
} & ButtonPropsType;

export function JoinGroupButton({
  onGroupJoinStatusChange,
  buttonText = "Join Group",
  ...rest
}: JoinGroupButtonProps) {
  return (
    <Button size="sm" onClick={() => onGroupJoinStatusChange?.()} {...rest}>
      {buttonText}
    </Button>
  );
}
