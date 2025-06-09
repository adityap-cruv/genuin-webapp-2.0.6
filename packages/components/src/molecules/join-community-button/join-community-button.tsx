import { Button, type ButtonPropsType } from "@genuin/ui/button";
import type { CommunityUserRole } from "@types/post";

type JoinCommunityButtonProps = {
  onCommunityJoinStatusChange?: (newRole: CommunityUserRole) => void;
  buttonText?: string;
} & ButtonPropsType;

export function JoinCommunityButton({
  onCommunityJoinStatusChange,
  buttonText = "Join Community",
  ...rest
}: JoinCommunityButtonProps) {
  return (
    <Button
      size="md"
      onClick={() => onCommunityJoinStatusChange?.("MEMBER")}
      {...rest}
    >
      {buttonText}
    </Button>
  );
}
