import { useAuthContext } from "@genuin/components/context/auth";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { AuthenticationModal } from "@genuin/components/organisms/authentication-modal";
import { type CommentListType } from "@genuin/components/react-query/api/comments";
import { MentionInput } from "../mention-input";
import { useMemo } from "react";
import { createReturnQueryParams } from "@genuin/components/lib/utils/return-query";
import { ActionPopover } from "../actions/action-popover";
import { useEmbedConfigs } from "@genuin/components/hooks/embed/use-embed-config";
import { Link } from "../link";

// const commentFormSchema = z.object({
//   comment: z.string().min(1, { message: "" }),
// });

// type CommentFormValues = z.infer<typeof commentFormSchema>;

type CommentInputProps = {
  videoId: string;
  loopId: string;
  onCommentPosted?: (comment: CommentListType) => void;
  className?: string;
  disabled?: boolean;
  defaultValue?: string;
} & React.FormHTMLAttributes<HTMLFormElement>;

type CommentInputBoxProps = {
  communityId: string;
  videoSlug: string;
  /**
   * Share url of the video to be used for sharing comments.
   */
  shareUrl: string;
} & Omit<CommentInputProps, "onCommentPosted" | "videoId" | "loopId"> & {
    videoId: string;
    loopId: string;
    onCommentPosted?: CommentInputProps["onCommentPosted"];
  };

export function CommentInputBox({
  videoId,
  loopId,
  communityId,
  videoSlug,
  shareUrl,
  onCommentPosted,
  ...commentInputProps
}: CommentInputBoxProps) {
  const { authenticationStatus, user, handleAuthCallback } = useAuthContext();
  // const { brandDetails } = useBaseContext();
  const embedDetails = useSafeEmbedContext();
  const { modalConfig } = useEmbedConfigs();
  const authInfo = embedDetails?.embedData.authInfo;

  const returnQueryParams = useMemo(
    () =>
      createReturnQueryParams({
        url: shareUrl,
        action: "comment",
        additionalParams: {
          videoSlug,
        },
      }),
    [shareUrl, videoSlug]
  );

  const authClickHandler = handleAuthCallback({
    authCallbackData: { action: "comment", path: "/", returnQueryParams },
    urlToOpen: shareUrl,
  });

  // Special case for brand ID 2357, unauthenticated users with auth info
  if (
    authenticationStatus === "unauthenticated" &&
    (authInfo?.signInUrl || authInfo?.signUpUrl) &&
    embedDetails?.embedData.card_layout_id === 3
  ) {
    return (
      <ActionPopover
        content={"to comment on this Short."}
        params={returnQueryParams}
        align="start"
      >
        <div className="gencl:h-18">
          <MentionInput
            videoId={videoId}
            loopId={loopId}
            readonly={true}
            onCommentPosted={onCommentPosted}
            {...commentInputProps}
          />
        </div>
      </ActionPopover>
    );
  }

  if (authenticationStatus === "unauthenticated") {
    if (authClickHandler) {
      return (
        <div className="gencl:cursor-pointer">
          <MentionInput
            videoId={videoId}
            loopId={loopId}
            onCommentPosted={onCommentPosted}
            onClick={authClickHandler}
            // disabled={true}
            {...commentInputProps}
          />
        </div>
      );
    }

    if (modalConfig.hideModal) {
      return (
        <Link href={shareUrl} target="_blank">
          <MentionInput
            videoId={videoId}
            loopId={loopId}
            {...commentInputProps}
          />
        </Link>
      );
    }
    return (
      <AuthenticationModal
        getAppData={{
          data: {
            type: "comment",
            payload: {
              communityId: communityId,
              loopId: loopId,
              videoSlug: videoSlug,
            },
          },
        }}
      >
        <div>
          <MentionInput
            videoId={videoId}
            loopId={loopId}
            onCommentPosted={onCommentPosted}
            {...commentInputProps}
          />
        </div>
      </AuthenticationModal>
    );
  }

  return (
    <MentionInput
      videoId={videoId}
      loopId={loopId}
      onCommentPosted={onCommentPosted}
      onClick={authClickHandler}
      disabled={!user}
      user={
        user
          ? {
              image: user?.image,
              isAvatar: user?.isAvatar,
              name: user?.name,
            }
          : undefined
      }
      {...commentInputProps}
    />
  );
}
