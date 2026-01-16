import React, { useCallback, memo, Suspense, lazy } from "react";
import type { CommunityUserRole } from "@genuin/components/types/post";
import { useAuthContext } from "@genuin/components/context/auth";
const AuthenticationModal = React.lazy(() =>
  import("../../organisms/authentication-modal").then((m) => ({
    default: m.AuthenticationModal,
  }))
);
import { Button as PrimitiveButton } from "@genuin/ui/components/button";
import {
  useJoinCommunityMutation,
  useLeaveCommunityMutation,
} from "@genuin/components/react-query/api/community/join/join";
import { Loader } from "@genuin/ui/components/loader";
import { Toast } from "@genuin/ui/toaster";
import { buildPageUrl } from "@genuin/components/lib/utils/pages";
import { createReturnQueryParams } from "@genuin/components/lib/utils/return-query";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { useAnalytics } from "@genuin/components/context/analytics";
import { Link } from "../link";
import { useRouter } from "@genuin/components/hooks/use-router";
import { setQueryDataForJoinCommunityStatusInFeed } from "@genuin/components/react-query/api/feed";
import { getPartialQueryKeyForFeed } from "@genuin/components/react-query/keys/feed";

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
  videoId?: string;
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

export const JoinCommunityButton = memo(function JoinCommunityButton({
  role,
  communityHandle,
  communityId,
  isPrivate,
  slug,
  onCommunityJoinStatusChange,
  ...restProps
}: JoinCommunityButtonProps) {
  const { authenticationStatus, handleAuthCallback } = useAuthContext();
  const { modalConfig } = useEmbedConfigs();

  // If user is leader or moderator of the community, then don't show the join button.
  if (role === "LEADER" || role === "MODERATOR") return;

  const button = (
    <Button
      communityHandle={communityHandle}
      communityId={communityId}
      isPrivate={isPrivate}
      slug={slug}
      role={role}
      onCommunityJoinStatusChange={onCommunityJoinStatusChange}
      {...restProps}
    />
  );

  if (authenticationStatus === "unauthenticated") {
    const communityUrl = buildPageUrl({ type: "community", slug: slug });
    const clickHandler = handleAuthCallback({
      authCallbackData: {
        action: "join-community",
        path: communityUrl,
        returnQueryParams: createReturnQueryParams({
          url: communityUrl,
          action: "join-community",
        }),
      },
      pendingActionData: {
        action: "join-community",
        communityId: communityId,
      },
    });

    // In case of embed if auth handler is configured than clickHandler will be called no need to open the authentication modal.
    // default clickHandler will be undefined in case of non-embed or if auth handler is not configured.
    if (clickHandler) {
      return <span onClick={clickHandler}>{button}</span>;
    }

    // In case of embed hideModal will come true for that case open link in new tab.
    if (modalConfig.hideModal) {
      return (
        <Link
          href={buildPageUrl({ type: "community", slug: slug })}
          target="_blank"
        >
          {button}
        </Link>
      );
    }

    return (
      <Suspense fallback={null}>
        <AuthenticationModal
          getAppData={{
            description: (
              <>
                Download app to join the <br />
                <span className="font-bold">@{communityHandle}</span> community.
              </>
            ),
            data: {
              type: "join_community",
              payload: {
                communityName: communityHandle,
                slug: slug,
              },
            },
          }}
          asChild
        >
          {button}
        </AuthenticationModal>
      </Suspense>
    );
  }

  return button;
});

function Button({
  role = "UNJOINED",
  communityHandle,
  communityName,
  communityId,
  isPrivate,
  disabled,
  roleTexts = DEFAULT_ROLE_TEXTS,
  onClick,
  theme,
  slug,
  onCommunityJoinStatusChange,
  ...rest
}: JoinCommunityButtonProps) {
  const { user } = useAuthContext();
  const { track, EventName } = useAnalytics();
  const router = useRouter();

  const { mutate: joinCommunity, isPending } = useJoinCommunityMutation({
    onSuccess: (newStatus) => {
      onCommunityJoinStatusChange?.(newStatus);
      track(EventName.COMMUNITY_JOINED, {
        content_id: communityId,
        slug: slug,
        community_id: communityId,
        community_handle: communityHandle,
        community_name: communityName,
        is_private: isPrivate,
        ...(rest.videoId && { video_id: rest.videoId }),
      });

      // Emit SDK event only in embed/placement case (when in iframe)
      setQueryDataForJoinCommunityStatusInFeed({
        queryKey: getPartialQueryKeyForFeed(),
        communityId,
        newRole: newStatus,
      });
    },
    onError: (error) => {
      Toast.Error({ message: "Failed to join community" });
    },
  });

  const { mutate: leaveCommunity, isPending: isPendingLeaveCommunity } =
    useLeaveCommunityMutation({
      onSuccess: (newStatus) => {
        onCommunityJoinStatusChange?.(newStatus);
        track(EventName.COMMUNITY_LEFT, {
          content_id: communityId,
          slug: slug,
          community_id: communityId,
          community_handle: communityHandle,
          community_name: communityName,
          is_private: isPrivate,
          ...(rest.videoId && { video_id: rest.videoId }),
        });

        setQueryDataForJoinCommunityStatusInFeed({
          queryKey: getPartialQueryKeyForFeed(),
          communityId,
          newRole: newStatus,
        });
      },
      onError: (error) => {
        Toast.Error({ message: "Failed to leave community" });
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
      disabled={buttonDisabled}
      onClick={handleClick}
      {...rest}
      theme={
        theme
          ? theme
          : role === "MEMBER"
            ? "outline"
            : role === "REQUESTED"
              ? "secondary"
              : "primary"
      }
    >
      {isLoading ? (
        <Loader
          size={rest.shape === "pill" ? "xs" : "sm"}
          strokeColor="black"
        />
      ) : (
        (roleTexts[role] ?? DEFAULT_ROLE_TEXTS[role])
      )}
    </PrimitiveButton>
  );
}
