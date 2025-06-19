import { useAuthContext } from "@genuin/components/context/auth";
import { AuthenticationModal } from "@genuin/components/organisms/authentication-modal";
import { useJoinGroupMutation } from "@genuin/components/react-query/api/group/join";
import { GroupUserStatusType } from "@genuin/components/types/roles";
import { Button as PrimitiveButton } from "@genuin/ui/button";
import { toastError } from "@genuin/ui/components/toaster";
import { useLeaveGroupMutation } from "@genuin/components/react-query/api/group/join";
import { ComponentProps, useCallback } from "react";
import { Loader } from "@genuin/ui/components/loader";

const DEFAULT_BUTTON_TEXT = {
  UNJOINED: "Join Group",
  JOINED: "Joined",
  REQUESTED: "Requested",
};

type JoinGroupButtonProps = {
  groupId: string;
  groupName: string;
  groupDescription: string;
  shareUrl: string;
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
    return (
      <AuthenticationModal
        getAppData={{
          data: {
            type: "join_as_collaborator",
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
      onSuccess: (status) => {
        onGroupJoinStatusChange?.(status);
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
      // size="sm"
      onClick={handleGroupJoin}
      disabled={disabled}
      {...restProps}
      theme={role === "UNJOINED" ? "primary" : "secondary"} 
    >
      {isLoading ? (
        <Loader strokeColor="white" />
      ) : (
        (buttonTexts[role] ?? DEFAULT_BUTTON_TEXT[role])
      )}
    </PrimitiveButton>
  );
}
