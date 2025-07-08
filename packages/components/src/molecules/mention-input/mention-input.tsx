"use client";
import { useEffect, useRef, useState } from "react";
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
import { cn } from "@genuin/ui/lib/utils";
import { Command, CommandList, CommandItem } from "@genuin/ui/components";
import { useCommentMentions } from "../../hooks/use-comment-mentions";
import { useCommentInputHandlers } from "../../hooks/use-comment-input-handlers";
import HighlightedInput from "./highlighted-field";
import { Loader } from "@genuin/ui/components/loader";

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
  authenticationStatus?: string;
  onCommentPosted?: (comment: any) => void;
}

export function MentionInput({
  videoId,
  loopId,
  user,
  authenticationStatus,
  onCommentPosted,
}: MentionInputProps) {
  const form = useForm<CommentFormValues>({
    resolver: zodResolver(commentFormSchema),
    mode: "onChange",
    defaultValues: { comment: "" },
    criteriaMode: "firstError",
  });

  const [selectedMentions, setSelectedMentions] = useState<SelectedMention[]>(
    []
  );
  const inputRef = useRef<HTMLInputElement | null>(null);
  const commentValue = form.watch("comment");
  const { formState } = form;
  const isFormValid = formState.isValid && commentValue.trim().length > 0;

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

  const { handleInputChange, commentSubmit, isPending } =
    useCommentInputHandlers({
      form,
      selectedMentions,
      setSelectedMentions,
      videoId,
      loopId,
      onCommentPosted,
    });
    
  useEffect(() => {
    console.log("MentionInput - commentValue updated:", commentValue);
  }, [commentValue]);

  // Add a debug log to track form state
  useEffect(() => {
    console.log("Form state:", {
      isDirty: formState.isDirty,
      isValid: formState.isValid,
      isSubmitting: formState.isSubmitting,
      errors: formState.errors,
    });
  }, [formState]);

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(commentSubmit)}
        className="gencl:absolute gencl:bottom-0 gencl:left-0 gencl:right-0 gencl:bg-white gencl:p-4 gencl:border-t gencl:border-secondary-150 gencl:flex gencl:justify-between"
      >
        {isMentioning && (
          <div className="gencl:absolute gencl:left-0 gencl:w-full gencl:z-50 gencl:bottom-18.25">
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
        <div className="gencl:flex-1 gencl:relative">
          <div className="gencl:border gencl:border-secondary-150 gencl:rounded-lg gencl:py-2 gencl:px-3 gencl:flex gencl:gap-3 gencl:w-full gencl:min-h-10">
            {!!user && (
              <Avatar
                alt={user.name || ""}
                isAvatar={user.isAvatar || false}
                imageUrl={user.image || ""}
                size="xs"
              />
            )}
            <div className="gencl:flex-1 gencl:relative">
              {/* Use FormField to properly register the input with React Hook Form */}
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
                          field.onChange(e);
                          handleInputChange(e);
                        }}
                        onKeyDown={handleMentionKeyDown}
                        selectedMentions={selectedMentions}
                        placeholder="Add a comment"
                        className="w-full"
                        aria-invalid={!!form.formState.errors.comment}
                        maxLength={500}
                        name={field.name}
                      />
                    </div>
                  </FormControl>
                )}
              />
            </div>
          </div>
          <FormMessage />
        </div>

        <Button
          type="submit"
          theme="text"
          className={cn(
            "gencl:!text-body-1-medium",
            isFormValid ? "gencl:text-primary" : "gencl:text-secondary-400"
          )}
          disabled={!isFormValid || isPending}
          aria-label="Post comment"
        >
          {isPending ? <Loader size="xs" /> : "Post"}
        </Button>
      </form>
    </Form>
  );
}

export default MentionInput;
