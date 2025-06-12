import { useAuthContext } from "@context/auth";
import { AuthenticationModal } from "@organisms/authentication-modal";
import { useJoinGroupMutation } from "@react-query/api/group/join";
import { GroupUserStatusType } from "@types/roles";
import { Button as PrimitiveButton } from "@genuin/ui/button";
import { toastError } from "@genuin/ui/components/toaster";
import { useLeaveGroupMutation } from "@react-query/api/group/join";
import { ComponentProps, useCallback } from "react";
import { Loader } from "@genuin/ui/components/loader";

const DEFAULT_BUTTON_TEXT = {
  UNJOINED: "Join Group",
  JOINED: "Joined",
  REQUESTED: "Requested",
};

type JoinGroupButtonProps = {
  groupId: string;
  role: GroupUserStatusType;
  isPrivate: boolean;
  /**
   * Custom button texts for each role. if not provided, defaults will be used.
   */
  buttonTexts?: Partial<Record<GroupUserStatusType, string>>; // Custom button texts for each role
  onGroupJoinStatusChange?: (newRole: GroupUserStatusType) => void;
} & ComponentProps<typeof PrimitiveButton>;

export function JoinGroupButton({ ...restProps }: JoinGroupButtonProps) {
  const { authenticationStatus } = useAuthContext();

  const button = <Button {...restProps} />;

  if (authenticationStatus === "unauthenticated") {
    return <AuthenticationModal asChild>{button}</AuthenticationModal>;
  }

  return button;
}

function Button({
  buttonTexts = DEFAULT_BUTTON_TEXT,
  groupId,
  role = "UNJOINED",
  disabled: propDisabled,
  onClick,
  onGroupJoinStatusChange,
  ...restProps
}: JoinGroupButtonProps) {
  const { user } = useAuthContext();
  const { mutate: joinGroup, isPending: isPendingJoinGroup } =
    useJoinGroupMutation({
      onSuccess: () => {
        onGroupJoinStatusChange?.("JOINED");
      },
      onError: () => {
        toastError("Failed to join group");
      },
    });

  const { mutate: leaveGroup, isPending: isPendingLeaveGroup } =
    useLeaveGroupMutation({
      onSuccess: () => {
        onGroupJoinStatusChange?.("UNJOINED");
      },
      onError: () => {
        toastError("Failed to leave group");
      },
    });

  const handleGroupJoin = useCallback(
    (e: any) => {
      onClick?.(e);
      if (!user) {
        return;
      }

      if (role === "UNJOINED") {
        joinGroup({ groupId });
      }

      if (role === "JOINED") {
        leaveGroup({ groupId });
      }
    },
    [groupId, role, user]
  );

  const isLoading = isPendingJoinGroup || isPendingLeaveGroup;

  const disabled = isLoading || role === "REQUESTED" || propDisabled;

  return (
    <PrimitiveButton
      onClick={handleGroupJoin}
      disabled={disabled}
      {...restProps}
    >
      {isLoading ? (
        <Loader strokeColor="white" />
      ) : (
        (buttonTexts[role] ?? DEFAULT_BUTTON_TEXT[role])
      )}
    </PrimitiveButton>
  );
}
