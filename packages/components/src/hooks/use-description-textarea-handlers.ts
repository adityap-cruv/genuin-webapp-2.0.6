import { useCallback } from "react";
import type { Dispatch, SetStateAction } from "react";
import type { useForm } from "react-hook-form";

import { convertCommentTextToArray } from "@genuin/components/molecules/comments/utils";

type SelectedMention = {
  handle: string;
  id: string | number;
  slug?: string;
  type: "member" | "community" | "url";
};

type CommentFormValues = {
  comment: string;
};

export function useCommentTextareaHandlers({
  form,
  selectedMentions,
  setSelectedMentions,
  onPayload,
}: {
  form: ReturnType<typeof useForm<CommentFormValues>>;
  selectedMentions: SelectedMention[];
  setSelectedMentions: Dispatch<SetStateAction<SelectedMention[]>>;
  onPayload?: (payload: any) => void;
}) {
  const REGEX_FOR_URLS = /(?:https?:\/\/)?(?:www\.)?[\w-]+(\.[\w-]+)+(\/[\S]*)?/g;

  // Input Change Handler
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { value } = e.target;

      form.setValue("comment", value, {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      });

      const urlMatches = value.match(REGEX_FOR_URLS);

      setSelectedMentions((prev) => {
        let newMentions = prev.filter((mention) => {
          if (mention.type === "url") {
            return urlMatches?.includes(mention.handle);
          } else {
            const handle = mention.handle.startsWith("@") ? mention.handle : `@${mention.handle}`;
            return value.includes(handle) || value.includes(mention.handle.replace(/^@/, ""));
          }
        });

        if (urlMatches && urlMatches.length > 0) {
          const lastUrl = urlMatches[urlMatches.length - 1];
          if (typeof lastUrl === "string" && !newMentions.some((m) => m.type === "url" && m.handle === lastUrl)) {
            newMentions = newMentions.filter((m) => m.type !== "url");
            newMentions.push({ handle: lastUrl, id: lastUrl, type: "url" });
          }
        }

        return newMentions;
      });
    },
    [form, setSelectedMentions]
  );

  // Blur Handler: Save the comment
  const handleInputBlur = useCallback(() => {
    const comment = form.getValues("comment");

    const parsedComment = convertCommentTextToArray(comment, selectedMentions);

    const finalPayload = {
      description_text: comment ? comment : null,
      description_data: comment ? JSON.stringify(parsedComment) : null,
    };

    onPayload?.(finalPayload);
  }, [form, selectedMentions]);

  const commentSubmit = () => {
    console.log("submit");
  };

  return {
    handleInputChange,
    commentSubmit,
    handleInputBlur,
    isPending: undefined,
  };
}
