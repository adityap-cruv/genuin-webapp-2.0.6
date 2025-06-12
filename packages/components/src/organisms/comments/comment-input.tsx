import { useAuthContext } from "@context/auth";
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
import { usePostComment } from "@react-query/api/comments";
import { useCallback } from "react";
import { cn } from "@genuin/ui/lib/utils";
import { AuthenticationModal } from "@organisms/authentication-modal";

const commentFormSchema = z.object({
  comment: z.string().min(1, { message: "" }),
});

type CommentFormValues = z.infer<typeof commentFormSchema>;

export function CommentInputBox({ videoId , loopId }: { videoId: string , loopId : string }) {
  const { user } = useAuthContext();

  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    mode: "onChange",
    defaultValues: { comment: "" },
    criteriaMode: "firstError",
  });

  const { mutate: postComment, isPending } = usePostComment({
    onSuccess: (response) => {
      if (response.code === 1003) {
        form.setError("comment", {
          message: "something went wrong!",
        });
        return;
      }
      form.reset();
    },
    onError(error) {
      form.setError("comment", {
        message: "something went wrong!",
      });
    },
  });

const commentSubmit = useCallback(
    ({ comment }: CommentFormValues) => {
        postComment({
            commentText: comment,
            commentData: [],
            type: 3,
            videoId,
            loopId,
        });
    },
    [postComment, videoId, loopId]
);

  return (
 <AuthenticationModal>
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
                  {user && (
                    <Avatar
                      alt={user.name}
                      isAvatar={user.isAvatar}
                      imageUrl={user.image}
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
 </AuthenticationModal>
  );
}
