import React, { useCallback } from "react";
import type { CommunityUserRole } from "@genuin/components/types/post";
import { useAuthContext } from "@genuin/components/context/auth";
import { AuthenticationModal } from "@genuin/components/organisms/authentication-modal";
import { Button as PrimitiveButton } from "@genuin/ui/components/button";
import {
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
} from "@genuin/components/react-query/api/community/join/join";
import { Loader } from "@genuin/ui/components/loader";
import { toastError } from "@genuin/ui/toaster";

// TODO: lazy load authentication modal.
type JoinCommunityButtonProps = {
  buttonText?: string;
  isPrivate: boolean;
  communityId: string;
  communityHandle: string;
  communityName: string;
  slug: string;
  roleTexts?: Partial<Record<CommunityUserRole, string>>;
  role: CommunityUserRole;
  onCommunityJoinStatusChange?: (newRole: CommunityUserRole) => void;
} & React.ComponentProps<typeof PrimitiveButton>;

// default text values for each role
const DEFAULT_ROLE_TEXTS: Record<CommunityUserRole, string> = {
  UNJOINED: "Join Community",
  MEMBER: "Joined",
  REQUESTED: "Requested",
  LEADER: "",
  MODERATOR: "",
};

export function JoinCommunityButton({
  role,
  ...restProps
}: JoinCommunityButtonProps) {
  const { authenticationStatus } = useAuthContext();

  // If user is leader or moderator of the community, then don't show the join button.
  if (role === "LEADER" || role === "MODERATOR") return;

  const button = <Button role={role} {...restProps} />;

  if (authenticationStatus === "unauthenticated") {
    return (
      <AuthenticationModal
        getAppData={{
          description: (
            <>
              Download app to join the <br />
              <span className="font-bold">
                @{restProps.communityHandle}
              </span>{" "}
              community.
            </>
          ),
          data: {
            type: "join_community",
            payload: {
              communityName: restProps.communityHandle,
              slug: restProps.slug,
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
  role = "UNJOINED",
  communityId,
  isPrivate,
  disabled,
  roleTexts = DEFAULT_ROLE_TEXTS,
  onClick,
  onCommunityJoinStatusChange,
  ...rest
}: JoinCommunityButtonProps) {
  const { user } = useAuthContext();

  const { mutate: joinCommunity, isPending } = useJoinCommunityMutation({
    onSuccess: (newStatus) => {
      onCommunityJoinStatusChange?.(newStatus);
    },
    onError: (error) => {
      toastError("Failed to join community");
    },
  });

  const { mutate: leaveCommunity, isPending: isPendingLeaveCommunity } =
    useLeaveCommunityMutation({
      onSuccess: (newStatus) => {
        onCommunityJoinStatusChange?.(newStatus);
      },
      onError: (error) => {
        toastError("Failed to leave community");
      },
    });

  const handleClick = useCallback(
    (e: any) => {
      onClick?.(e);
      if (!user) return;
      if (role === "UNJOINED") {
        joinCommunity({
          communities: [communityId],
          isPrivate,
          users: [{ user_id: user?.id ?? "" }],
        });
      } else if (role === "MEMBER" || role === "REQUESTED") {
        leaveCommunity(communityId);
      }
    },
    [onClick, user, role]
  );

  const buttonDisabled =
    isPending || disabled || isPendingLeaveCommunity || role === "REQUESTED";

  const isLoading = isPending || isPendingLeaveCommunity;

  return (
    <PrimitiveButton
      size="sm"
      disabled={buttonDisabled}
      onClick={handleClick}
      theme={role === "MEMBER" ? "secondary" : "primary"}
      {...rest}
    >
      {isLoading ? (
        <Loader size="xs" strokeColor={role === "MEMBER" ? "black" : "white"} />
      ) : (
        (roleTexts[role] ?? DEFAULT_ROLE_TEXTS[role])
      )}
    </PrimitiveButton>
  );
}
