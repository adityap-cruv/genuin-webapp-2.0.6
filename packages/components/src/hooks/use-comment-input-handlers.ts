import { useCallback } from "react";
import { Toast } from "@genuin/ui/components/toaster";
import { useCreateCommentMutation, type CommentListType } from "@genuin/components/react-query/api/comments";
import { convertCommentTextToArray } from "../organisms/comments/utils";
import { useForm } from "react-hook-form";
import { Dispatch, SetStateAction } from "react";

type SelectedMention = {
  handle: string;
  id: string | number;
  slug?: string;
  type: "member" | "community" | "url";
};

type CommentFormValues = {
  comment: string;
};

export function useCommentInputHandlers({
  form,
  selectedMentions,
  setSelectedMentions,
  videoId,
  loopId,
  onCommentPosted,
}: {
  form: ReturnType<typeof useForm<CommentFormValues>>;
  selectedMentions: SelectedMention[];
  setSelectedMentions: Dispatch<SetStateAction<SelectedMention[]>>;
  videoId: string;
  loopId: string;
  onCommentPosted?: (comment: CommentListType) => void;
}) {
  const REGEX_FOR_URLS =
    /(?:https?:\/\/)?(?:www\.)?[\w-]+(\.[\w-]+)+(\/[\S]*)?/g;
  const { mutate: postComment, isPending } = useCreateCommentMutation({
    onSuccess: (response) => {
      if (response.commentData) {
        onCommentPosted?.(response.commentData);
      }
      setSelectedMentions([]);
      form.reset();
    },
    onError() {
      Toast.Error({
        message: "Failed to post comment. Please try again later.",
      });
    },
  });

  // Input change handler
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;
      form.setValue("comment", value, { 
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true
      });
      // URL detection logic
      const urlMatches = value.match(REGEX_FOR_URLS);
      // Remove mentions that are no longer present in the input value
      setSelectedMentions((prev) => {
        // For URL mentions, only keep the one present in the input
        let newMentions = prev.filter((mention) => {
          if (mention.type === "url") {
            return urlMatches && urlMatches.includes(mention.handle);
          } else {
            // For member/community, check if handle is present in value
            // Allow both @handle and handle
            const handle = mention.handle.startsWith("@") ? mention.handle : `@${mention.handle}`;
            return value.includes(handle) || value.includes(mention.handle.replace(/^@/, ""));
          }
        });
        // For URL, only allow one
        if (urlMatches && urlMatches.length > 0) {
          // Only add the last URL if not already present
          const lastUrl = urlMatches[urlMatches.length - 1];
          if (typeof lastUrl === "string" && !newMentions.some((m) => m.type === "url" && m.handle === lastUrl)) {
            // Remove all previous url mentions and add the new one
            newMentions = newMentions.filter((m) => m.type !== "url");
            newMentions.push({ handle: lastUrl, id: lastUrl, type: "url" });
          }
        }
        return newMentions;
      });
      // Add new URL mention if not already present (handled above)
    },
    [form, selectedMentions, setSelectedMentions]
  );

  // Submit handler
  const commentSubmit = useCallback(() => {
    postComment({
      commentText: form.getValues("comment"),
      commentData: convertCommentTextToArray(
        form.getValues("comment"),
        selectedMentions
      ),
      videoId,
      loopId,
    });
  }, [postComment, form, selectedMentions, videoId, loopId]);

  return {
    handleInputChange,
    commentSubmit,
    isPending,
  };
} 