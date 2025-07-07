import { useCallback, useRef, useState, useEffect, RefObject, Dispatch, SetStateAction } from "react";
import { useMentionUser, CommentMention } from "@genuin/components/react-query/api/comments";
import { useAbortController } from "./use-abort-controller";
import { useForm } from "react-hook-form";

type SelectedMention = {
  handle: string;
  id: string | number;
  slug?: string;
  type: "member" | "community" | "url";
};

type CommentFormValues = {
  comment: string;
};

export function useCommentMentions({
  videoId,
  inputRef,
  commentValue,
  setSelectedMentions,
  selectedMentions,
  form,
}: {
  videoId: string;
  inputRef: RefObject<HTMLInputElement | null>;
  commentValue: string;
  setSelectedMentions: Dispatch<SetStateAction<SelectedMention[]>>;
  selectedMentions: SelectedMention[];
  form: ReturnType<typeof useForm<CommentFormValues>>;
}) {
  const [filteredMentions, setFilteredMentions] = useState<CommentMention[]>([]);
  const { signal: mentionSignal, start: startAbort, abort: abortMention } = useAbortController();
  const [activeMentionIndex, setActiveMentionIndex] = useState<number>(0);
  const [isMentioningOverride, setIsMentioningOverride] = useState(false);

  // Derive mention state from the input value
  const caretPosition = inputRef.current?.selectionStart ?? 0;
  const textBeforeCaret = commentValue.slice(0, caretPosition);
  const mentionMatch = textBeforeCaret.match(/@([\w._]*)$/);
  const isMentioningRaw = !!mentionMatch;
  const mentionQuery = mentionMatch ? mentionMatch[1] : "";
  const isMentioning = isMentioningRaw && !isMentioningOverride;

  useEffect(() => {
    if (isMentioning && (mentionQuery || "").length > 0) {
      startAbort();
    } else {
      abortMention();
    }
  }, [isMentioning, mentionQuery, startAbort, abortMention]);

  // Use the useMentionUser hook
  const { data: mentionData } = useMentionUser(
    videoId,
    mentionQuery || "",
    isMentioning && (mentionQuery || "").length > 0,
    mentionSignal
  );

  useEffect(() => {
    if (isMentioning && mentionData) {
      setFilteredMentions(mentionData.data || []);
    } else if (!isMentioning) {
      setFilteredMentions([]);
    }
  }, [mentionData, isMentioning]);

  // Reset active index when mention list changes
  useEffect(() => {
    setActiveMentionIndex(0);
  }, [filteredMentions, isMentioning]);

  // Reset override when input changes (user types again)
  useEffect(() => {
    if (!isMentioningRaw) {
      setIsMentioningOverride(false);
    }
  }, [isMentioningRaw, commentValue]);

  // Mention select handler
  const handleUserSelect = useCallback(
    (selected: CommentMention) => {
      if (inputRef.current) {
        const value = commentValue;
        const start = value.slice(
          0,
          caretPosition - (mentionQuery?.length ?? 0) - 1
        );
        const end = value.slice(caretPosition);
        const isCommunity = !!selected.community;
        const handle = isCommunity
          ? (selected.community?.handle ?? "")
          : "@" + (selected.user?.nickname ?? "");
        const id = isCommunity
          ? (selected.community?.community_id ?? "")
          : (selected.user?.member_id ?? "");
        const slug = isCommunity ? (selected.community?.slug ?? "") : "";
        const type = isCommunity ? "community" : "member";
        const updatedText = `${start}${handle} ${end}`;
        setSelectedMentions((prev) => [...prev, { handle, id, slug, type }]);
        // When form is properly connected via FormField, the value update will be reflected
        form?.setValue?.("comment", updatedText, { 
          shouldValidate: true,
          shouldDirty: true, 
          shouldTouch: true 
        });
        setTimeout(() => {
          const newCaretPosition = start.length + handle.length + 1;
          inputRef.current?.setSelectionRange(
            newCaretPosition,
            newCaretPosition
          );
          inputRef.current?.focus();
        }, 0);
        setIsMentioningOverride(true);
        setFilteredMentions([]);
      }
    },
    [commentValue, caretPosition, mentionQuery, setSelectedMentions, inputRef, form]
  );

  // Keyboard navigation handler
  const handleMentionKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!isMentioning || filteredMentions.length === 0) return;

      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveMentionIndex((prev) =>
          prev < filteredMentions.length - 1 ? prev + 1 : 0
        );
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveMentionIndex((prev) =>
          prev > 0 ? prev - 1 : filteredMentions.length - 1
        );
      } else if (e.key === "Enter") {
        if (filteredMentions[activeMentionIndex]) {
          e.preventDefault();
          handleUserSelect(filteredMentions[activeMentionIndex]);
        }
      }
    },
    [isMentioning, filteredMentions, activeMentionIndex, handleUserSelect]
  );

  return {
    filteredMentions,
    isMentioning,
    handleUserSelect,
    activeMentionIndex,
    setActiveMentionIndex,
    handleMentionKeyDown,
  };
} 