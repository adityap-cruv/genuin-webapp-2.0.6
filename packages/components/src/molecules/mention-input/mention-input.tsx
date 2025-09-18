"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar } from "@genuin/ui/components/avatar";
import { Button } from "@genuin/ui/components/button";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormMessage,
  FormField,
  FormControl,
} from "@genuin/ui/components/form";
import { Loader } from "@genuin/ui/components/loader";
import { cn } from "@genuin/ui/lib/utils";
import { Command, CommandList, CommandItem } from "@genuin/ui/components";
import { useCommentMentions } from "../../hooks/use-comment-mentions";
import { useCommentInputHandlers } from "../../hooks/use-comment-input-handlers";
import { useCommentTextareaHandlers } from "../../hooks/use-description-textarea-handlers";
import HighlightedInput from "./highlighted-field";
import { useAnalytics } from "@genuin/components/context/analytics";

// Types for props
export type SelectedMention = {
  handle: string;
  id: string | number;
  slug?: string;
  type: "member" | "community" | "url";
};

const commentFormSchema = z.object({
  comment: z.string().min(1, { message: "" }),
});

type CommentFormValues = z.infer<typeof commentFormSchema>;

export { commentFormSchema, type CommentFormValues };

export interface MentionInputProps {
  videoId: string;
  loopId: string;
  user?: {
    name?: string;
    isAvatar?: boolean;
    image?: string;
  };
  onCommentPosted?: (comment: any) => void;
  onClick?: React.MouseEventHandler<HTMLFormElement>;
  /**
   * When true, disables the input functionality while still allowing onClick events
   */
  disabled?: boolean;
  onPayload?: (payload: any) => void;
  inputType: "text" | "textarea";
  maxLength: number;
  defaultValue?: string;
  postId?: string;
}

export function MentionInput({
  videoId,
  loopId,
  user,
  onCommentPosted,
  onClick,
  disabled = false,
  onPayload,
  inputType = "text",
  maxLength = 500,
  defaultValue,
  postId,
}: MentionInputProps) {
  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    mode: "onChange",
    defaultValues: { comment: defaultValue ?? "" },
    criteriaMode: "firstError",
  });
  const { track, EventName } = useAnalytics();

  const handleCommentPostSuccess = useCallback(
    (commentData: any) => {
      if (commentData[0].commentId) {
        track(EventName.VIDEO_COMMENTED, {
          video_id: videoId,
          content_id: commentData[0].commentId,
          content_category: "comment",
        });
      }
      onCommentPosted?.(commentData);
    },
    [track, EventName.VIDEO_COMMENTED, videoId, onCommentPosted]
  );

  const [selectedMentions, setSelectedMentions] = useState<SelectedMention[]>(
    []
  );
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [commentValue, setCommentValue] = useState("");
  const { formState } = form;
  const isFormValid = formState.isValid && commentValue.trim().length > 0;
  const [description, setDescription] = useState(defaultValue ?? "");

  const {
    filteredMentions,
    isMentioning,
    handleUserSelect,
    activeMentionIndex,
    handleMentionKeyDown,
  } = useCommentMentions({
    videoId,
    inputRef,
    commentValue,
    setSelectedMentions,
    selectedMentions,
    form,
  });

  const handlePayloadTextArea = (payload: any) => {
    onPayload?.(payload);
  };

  const { handleInputChange, handleInputBlur, commentSubmit, isPending } =
    inputType === "textarea"
      ? useCommentTextareaHandlers({
          form,
          selectedMentions,
          setSelectedMentions,
          onPayload: handlePayloadTextArea,
        })
      : useCommentInputHandlers({
          form,
          selectedMentions,
          setSelectedMentions,
          videoId,
          loopId,
          handleCommentPostSuccess,
        });

  useEffect(() => {
    const unSub = form.watch(({ comment }) => {
      if (comment) setCommentValue(comment);
    });
    return () => {
      unSub.unsubscribe();
    };
  }, [commentValue]);

  return (
    <Form {...form} key="comment">
      <form
        onSubmit={form.handleSubmit(commentSubmit)}
        onClick={onClick}
        className={cn(
          "gencl:left-0 gencl:right-0 gencl:bg-white gencl:border-secondary-150 gencl:flex gencl:justify-between gencl:items-center",
          {
            "gencl:absolute gencl:p-4 gencl:bottom-0 gencl:border-t":
              inputType === "text",
          }
        )}
      >
        {isMentioning && (
          <div
            className={cn(
              "gencl:absolute gencl:left-0 gencl:w-full gencl:z-50 ",
              {
                "gencl:bottom-18.25": inputType === "text",
                "gencl:top-36": inputType === "textarea",
              }
            )}
          >
            <Command className="gencl:bg-white gencl:rounded-t-2xl gencl:max-h-60 gencl:overflow-y-auto gencl:shadow-[0px_-4px_15px_0px_#3F3F3F0D]">
              <CommandList>
                {filteredMentions.map((mention: any, idx: number) => {
                  const isCommunity = !!mention.community;
                  const name = isCommunity
                    ? mention.community?.name || "Community"
                    : "@" + (mention.user?.nickname || "User");
                  const profileImage = isCommunity
                    ? mention.community?.dp || ""
                    : mention.user?.profile_image || "";

                  // Generate stable keys for React 19 optimization
                  const uniqueKey = isCommunity
                    ? `community-${mention.community?.community_id ?? idx}`
                    : `user-${mention.user?.member_id ?? idx}`;

                  return (
                    <CommandItem
                      key={uniqueKey}
                      onSelect={() => handleUserSelect(mention)}
                      className={cn(
                        "gencl:flex gencl:items-center gencl:gap-x-3 gencl:rounded-md gencl:p-2 gencl:px-4 gencl:cursor-pointer gencl:hover:bg-secondary-100",
                        idx === activeMentionIndex && "gencl:bg-secondary-100"
                      )}
                      value={name}
                    >
                      <Avatar
                        imageUrl={profileImage}
                        alt={name}
                        isAvatar={
                          isCommunity ? false : !!mention.user?.is_avatar
                        }
                        className="gencl:size-9"
                      />
                      <div className="gencl:pr-2">
                        {isCommunity ? (
                          <p className="gencl:line-clamp-1 gencl:text-black gencl:break-all gencl:text-body-1-semi-bold">
                            {mention.community?.name || "Community"}
                          </p>
                        ) : (
                          <>
                            <p className="gencl:text-secondary-700 gencl:line-clamp-1 gencl:break-all gencl:text-body-1-medium">
                              @{mention.user?.nickname || "User"}
                            </p>
                            <p className="gencl:line-clamp-1 gencl:text-black gencl:break-all gencl:text-body-1-semi-bold">
                              {mention.user?.name}
                            </p>
                          </>
                        )}
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandList>
            </Command>
          </div>
        )}
        <div
          className={cn("gencl:flex-1 gencl:relative", {
            "gencl:mt-7": inputType === "textarea",
          })}
        >
          <div
            className={cn(
              "gencl:border gencl:border-secondary-150 gencl:rounded-lg gencl:py-2 gencl:px-3 gencl:items-center gencl:flex gencl:gap-3 gencl:w-full gencl:min-h-10",
              {
                "gencl:border-red-400":
                  description.length === maxLength && inputType === "textarea",
              }
            )}
          >
            {!!user && (
              <Avatar
                alt={user.name || ""}
                isAvatar={user.isAvatar || false}
                imageUrl={user.image || ""}
                size="xs"
              />
            )}
            {inputType === "textarea" && (
              <div
                className="gencl:flex gencl:justify-between gencl:text-body-1-medium gencl:absolute gencl:left-0 gencl:right-0"
                style={{
                  marginTop: "-35px",
                }}
              >
                Description
                <span
                  className={cn(
                    "gencl:text-secondary-500 gencl:text-body-2-medium",
                    {
                      "gencl:text-error-status":
                        description.length === maxLength,
                    }
                  )}
                >
                  {description.length}/{maxLength}
                </span>
              </div>
            )}
            <div className="gencl:flex-1 gencl:relative">
              <FormField
                control={form.control}
                name="comment"
                render={({ field }) => (
                  <FormControl>
                    <div className="gencl:relative gencl:w-full">
                      <HighlightedInput
                        ref={inputRef}
                        value={field.value}
                        onChange={(e) => {
                          if (!disabled) {
                            field.onChange(e);
                            handleInputChange(e);
                            setDescription?.(e.target.value);
                            if (
                              inputType === "textarea" &&
                              description.length <= maxLength &&
                              postId
                            ) {
                              handleInputBlur?.();
                            }
                          }
                        }}
                        onBlur={(e) => {
                          field.onBlur();
                          if (
                            inputType === "textarea" &&
                            description.length <= maxLength &&
                            !postId
                          ) {
                            handleInputBlur?.();
                          }
                        }}
                        onKeyDown={!disabled ? handleMentionKeyDown : undefined}
                        selectedMentions={selectedMentions}
                        placeholder="Add a comment"
                        className="w-full"
                        aria-invalid={!!form.formState.errors.comment}
                        maxLength={maxLength}
                        name={field.name}
                        disabled={disabled}
                        onFocus={(e) => {
                          if (disabled) {
                            e.target.blur();
                          }
                        }}
                        inputType={inputType}
                      />
                    </div>
                  </FormControl>
                )}
              />
            </div>
          </div>
          {description.length === maxLength && inputType === "textarea" && (
            <p className="gencl:text-body-1-medium gencl:text-error-status gencl:mt-1">
              You've reached the 2000 character limit.
            </p>
          )}
          <FormMessage />
        </div>
        {inputType === "text" && (
          <Button
            type="submit"
            theme="text"
            className={cn(
              "gencl:!text-body-1-medium",
              isFormValid ? "gencl:text-primary" : "gencl:text-secondary-400"
            )}
            disabled={!isFormValid || isPending || !user}
            aria-label="Post comment"
          >
            {isPending ? <Loader size="xs" /> : "Post"}
          </Button>
        )}
      </form>
    </Form>
  );
}

export default MentionInput;
