import { useAuthContext } from "@genuin/components/context/auth";
import { AuthenticationModal } from "@genuin/components/organisms/authentication-modal";
import { useJoinGroupMutation } from "@genuin/components/react-query/api/group/join";
import { GroupUserStatusType } from "@genuin/components/types/roles";
import { Button as PrimitiveButton } from "@genuin/ui/button";
import { Toast } from "@genuin/ui/components/toaster";
import { useLeaveGroupMutation } from "@genuin/components/react-query/api/group/join";
import { ComponentProps, useCallback } from "react";
import { Loader } from "@genuin/ui/components/loader";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { createReturnQueryParams } from "@genuin/components/lib/utils/return-query";
import { useAnalytics } from "@genuin/components/context/analytics";
import { Link } from "../link";

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
  groupSlug: string;
  role: GroupUserStatusType;
  isPrivate: boolean;
  videoId?: string;
  /**
   * Custom button texts for each role. if not provided, defaults will be used.
   */
  buttonTexts?: Partial<Record<GroupUserStatusType, string>>; // Custom button texts for each role
  onGroupJoinStatusChange?: (newRole: GroupUserStatusType) => void;
} & ComponentProps<typeof PrimitiveButton>;

export function JoinGroupButton({
  groupId,
  ...restProps
}: JoinGroupButtonProps) {
  const { authenticationStatus, handleAuthCallback } = useAuthContext();
  const { modalConfig } = useEmbedConfigs();

  const button = <Button groupId={groupId} {...restProps} />;

  if (authenticationStatus === "unauthenticated") {
    const groupUrl = buildPageUrl({
      slug: restProps.groupSlug,
      type: "group",
    });

    const clickHandler = handleAuthCallback({
      authCallbackData: {
        action: "join-group",
        path: groupUrl,
        returnQueryParams: createReturnQueryParams({
          url: groupUrl,
          action: "join-group",
        }),
      },
      pendingActionData: {
        action: "join-group",
        groupId: groupId,
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
  groupName,
  groupSlug,
  isPrivate,
  role = "UNJOINED",
  disabled: propDisabled,
  onClick,
  onGroupJoinStatusChange,
  ...restProps
}: JoinGroupButtonProps) {
  const { user } = useAuthContext();
  const { track, EventName } = useAnalytics();
  const { mutate: joinGroup, isPending: isPendingJoinGroup } =
    useJoinGroupMutation({
      onSuccess: (status) => {
        onGroupJoinStatusChange?.(status);
        track(EventName.LOOP_JOINED, {
          content_id: groupId,
          slug: groupSlug,
          group_id: groupId,
          group_name: groupName,
          is_private: isPrivate,
          ...(restProps.videoId && { video_id: restProps.videoId }),
        });
      },
      onError: () => {
        Toast.Error({ message: "Failed to join group" });
      },
    });

  const { mutate: leaveGroup, isPending: isPendingLeaveGroup } =
    useLeaveGroupMutation({
      onSuccess: () => {
        onGroupJoinStatusChange?.("UNJOINED");
        track(EventName.LOOP_LEFT, {
          content_id: groupId,
          slug: groupSlug,
          group_id: groupId,
          group_name: groupName,
          is_private: isPrivate,
          ...(restProps.videoId && { video_id: restProps.videoId }),
        });
      },
      onError: () => {
        Toast.Error({ message: "Failed to leave group" });
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
      theme={
        role === "UNJOINED"
          ? "primary"
          : role === "JOINED"
            ? "outline"
            : "secondary"
      }
    >
      {isLoading ? (
        <Loader strokeColor={role === "JOINED" ? "black" : "white"} />
      ) : (
        (buttonTexts[role] ?? DEFAULT_BUTTON_TEXT[role])
      )}
    </PrimitiveButton>
  );
}
