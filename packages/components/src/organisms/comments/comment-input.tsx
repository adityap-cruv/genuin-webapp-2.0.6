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
import { toastError } from "@genuin/ui/components/toaster";
import {
  type CommentListType,
  useCreateCommentMutation,
} from "@genuin/components/react-query/api/comments";
import { convertCommentTextToArray } from "./utils";

const commentFormSchema = z.object({
  comment: z.string().min(1, { message: "" }),
});

type CommentFormValues = z.infer<typeof commentFormSchema>;

type CommentInputBoxProps = {
  videoId: string;
  loopId: string;
  onCommentPosted?: ComponentProps<typeof CommentInput>["onCommentPosted"];
};

export function CommentInputBox({
  videoId,
  loopId,
  onCommentPosted,
}: CommentInputBoxProps) {
  const { authenticationStatus } = useAuthContext();

  if (authenticationStatus === "unauthenticated")
    return (
      <AuthenticationModal>
        <CommentInput videoId={videoId} loopId={loopId} />
      </AuthenticationModal>
    );

  return (
    <CommentInput
      videoId={videoId}
      loopId={loopId}
      onCommentPosted={onCommentPosted}
    />
  );
}

type CommentInputProps = {
  videoId: string;
  loopId: string;
  onCommentPosted?: (comment: CommentListType) => void;
};

function CommentInput({ videoId, loopId, onCommentPosted }: CommentInputProps) {
  const { user, authenticationStatus } = useAuthContext();
  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    mode: "onChange",
    defaultValues: { comment: "" },
    criteriaMode: "firstError",
    disabled: authenticationStatus !== "authenticated",
  });

  const { mutate: postComment, isPending } = useCreateCommentMutation({
    onSuccess: (response) => {
      if (response.commentData) {
        onCommentPosted?.(response.commentData);
      }
    },
    onError() {
      toastError("Failed to post comment. Please try again later.");
    },
  });

  const commentSubmit = useCallback(
    ({ comment }: CommentFormValues) => {
      postComment({
        commentText: comment,
        commentData: convertCommentTextToArray(comment, []),
        videoId,
        loopId,
      });
    },
    [postComment, videoId, loopId]
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(commentSubmit)}
        className="gencl:absolute gencl:bottom-0 gencl:left-0 gencl:right-0 gencl:bg-white gencl:p-4 gencl:border-t gencl:border-secondary-200 gencl:flex gencl:justify-between"
      >
        <FormField
          control={form.control}
          name="comment"
          render={({ field }) => (
            <FormItem className="gencl:flex-1">
              <FormControl>
                <div className="gencl:border gencl:border-secondary-150 gencl:rounded-lg gencl:py-2 gencl:px-3 gencl:flex gencl:gap-3 gencl:w-full gencl:h-10">
                  {!!user && (
                    <Avatar
                      alt={user.name || ""}
                      isAvatar={user.isAvatar || false}
                      imageUrl={user.image || ""}
                      size="xs"
                    />
                  )}
                  <Input
                    {...field}
                    placeholder="Add a comment"
                    className="gencl:w-full gencl:border-0 gencl:!text-secondary-600 gencl:p-0 gencl:text-body-1-medium gencl:h-fit gencl:focus:border-0 gencl:focus:p-0 gencl:focus:rounded-none"
                    aria-invalid={!!form.formState.errors.comment}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          theme="text"
          className={cn(
            "gencl:text-body-1-medium",
            form.formState.isValid
              ? "gencl:text-primary"
              : "gencl:text-secondary-400"
          )}
          disabled={!form.formState.isValid || isPending}
        >
          {isPending ? "Posting..." : "Post"}
        </Button>
      </form>
    </Form>
  );
}
