import { ComponentProps, use } from "react";
import { useAuthContext } from "@genuin/components/context/auth";
import { AuthenticationModal } from "../authentication-modal";
import MentionInput from "@genuin/components/molecules/mention-input/mention-input";

type CommentInputBoxProps = {
  videoId: string;
  loopId: string;
  communityId: string;
  videoSlug: string;
  onCommentPosted?: ComponentProps<typeof MentionInput>["onCommentPosted"];
};

export function CommentInputBox({
  videoId,
  loopId,
  communityId,
  videoSlug,
  onCommentPosted,
}: CommentInputBoxProps) {
  const { authenticationStatus, user } = useAuthContext();

  const isDisabled = authenticationStatus !== "authenticated";
  if (isDisabled) {
    return (
      <AuthenticationModal
        getAppData={{
          data: {
            type: "comment",
            payload: {
              communityId: communityId || "",
              loopId: loopId || "",
              videoSlug: videoSlug || "",
            },
          },
        }}
      >
        <div>
          <MentionInput
            videoId={videoId}
            loopId={loopId}
            onCommentPosted={onCommentPosted}
          />
        </div>
      </AuthenticationModal>
    );
  }

  return (
    <MentionInput
      videoId={videoId}
      loopId={loopId}
      user={{
        image: user?.image,
        isAvatar: user?.isAvatar,
        name: user?.name,
      }}
      authenticationStatus={authenticationStatus}
      onCommentPosted={onCommentPosted}
    />
  );
}
