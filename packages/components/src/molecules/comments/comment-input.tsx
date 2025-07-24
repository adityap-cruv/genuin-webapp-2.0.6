import { useAuthContext } from "@genuin/components/context/auth";
import { Avatar } from "@genuin/ui/components/avatar";
import { Input } from "@genuin/ui/components/input";
import { Button } from "@genuin/ui/components/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@genuin/ui/components/form";
import { ComponentProps, useCallback } from "react";
import { cn } from "@genuin/ui/lib/utils";
import { AuthenticationModal } from "@genuin/components/organisms/authentication-modal";
import { Toast } from "@genuin/ui/components/toaster";
import {
  type CommentListType,
  useCreateCommentMutation,
} from "@genuin/components/react-query/api/comments";
import { convertCommentTextToArray } from "./utils";
import { MentionInput } from "../mention-input";
import { Loader } from "@genuin/ui/components/loader";

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
  onCommentPosted,
  ...commentInputProps
}: CommentInputBoxProps) {
  const { authenticationStatus, user } = useAuthContext();

  if (authenticationStatus === "unauthenticated") {
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
            authenticationStatus={authenticationStatus}
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
      user={{
        image: user?.image,
        isAvatar: user?.isAvatar,
        name: user?.name,
      }}
      authenticationStatus={authenticationStatus}
      {...commentInputProps}
    />
  );
}
