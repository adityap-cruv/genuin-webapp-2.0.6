import { useAuthContext } from "@genuin/components/context/auth";
import { useSafeEmbedContext } from "@genuin/components/context/embed/context";
import { useBaseContext } from "@genuin/components/context/base";
import { z } from "zod";
import { AuthenticationModal } from "@genuin/components/organisms/authentication-modal";
import { type CommentListType } from "@genuin/components/react-query/api/comments";
import { MentionInput } from "../mention-input";
import { useMemo } from "react";
import { createReturnQueryParams } from "@genuin/components/lib/utils/return-query";
import { ActionPopover } from "../actions/action-popover";

const commentFormSchema = z.object({
  comment: z.string().min(1, { message: "" }),
});

type CommentFormValues = z.infer<typeof commentFormSchema>;

type CommentInputProps = {
  videoId: string;
  loopId: string;
  onCommentPosted?: (comment: CommentListType) => void;
  className?: string;
  disabled?: boolean;
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
  const { brandDetails } = useBaseContext();
  const embedDetails = useSafeEmbedContext();
  const authInfo = embedDetails?.embedData.authInfo;
  const brandId = brandDetails.brand_id;

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
  });

  // Special case for brand ID 2357, unauthenticated users with auth info
  if (
    authenticationStatus === "unauthenticated" &&
    (authInfo?.signInUrl || authInfo?.signUpUrl) &&
    brandId === 2357
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
            onCommentPosted={onCommentPosted}
            {...commentInputProps}
          />
        </div>
      </ActionPopover>
    );
  }

  if (authenticationStatus === "unauthenticated" && !authClickHandler) {
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
