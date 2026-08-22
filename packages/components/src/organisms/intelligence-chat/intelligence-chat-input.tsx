"use client";

import { cn } from "@genuin/ui/lib/utils";
import { ArrowUp, Sparkle } from "lucide-react";
import * as React from "react";

import type { IntelligenceChatInputProps } from "./intelligence-chat.types";

const MAX_ROWS = 5;
const LINE_HEIGHT_PX = 20;

/**
 * Composer pinned to the bottom of the Intelligence panel: sparkle, an
 * auto-growing textarea ("Ask Anything"), and a round primary send button.
 * Enter sends; Shift+Enter inserts a newline.
 */
export const IntelligenceChatInput = React.forwardRef<HTMLFormElement, IntelligenceChatInputProps>(
  function IntelligenceChatInput({ onSend, disabled = false, placeholder = "Ask Anything", className, ...props }, ref) {
    const [value, setValue] = React.useState("");
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const inputId = React.useId();
    const canSend = !disabled && value.trim().length > 0;

    const resize = React.useCallback(() => {
      const element = textareaRef.current;
      if (!element) return;
      element.style.height = "auto";
      element.style.height = `${Math.min(element.scrollHeight, MAX_ROWS * LINE_HEIGHT_PX)}px`;
    }, []);

    React.useEffect(resize, [value, resize]);

    const submit = () => {
      const text = value.trim();
      if (!text || disabled) return;
      onSend(text);
      setValue("");
      textareaRef.current?.focus();
    };

    return (
      <form
        ref={ref}
        data-slot="intelligence-chat-input"
        onSubmit={(event) => {
          event.preventDefault();
          submit();
        }}
        className={cn("gencl:shrink-0 gencl:border-t gencl:border-secondary-150 gencl:pt-2", className)}
        {...props}>
        <label htmlFor={inputId} className="gencl:sr-only">
          Ask Intelligence
        </label>
        <div
          className={cn(
            "gencl:flex gencl:items-end gencl:gap-2 gencl:rounded-lg gencl:border gencl:border-secondary-150 gencl:bg-white gencl:p-2",
            "gencl:focus-within:border-secondary-600"
          )}>
          <span
            aria-hidden="true"
            className="gencl:flex gencl:size-9 gencl:shrink-0 gencl:items-center gencl:justify-center gencl:rounded-full gencl:bg-blue/5">
            <Sparkle strokeWidth={1.75} className="gencl:size-5 gencl:text-blue" />
          </span>

          <textarea
            id={inputId}
            ref={textareaRef}
            rows={1}
            value={value}
            disabled={disabled}
            placeholder={placeholder}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                submit();
              }
            }}
            className={cn(
              "gencl:my-2 gencl:max-h-25 gencl:min-h-5 gencl:w-full gencl:flex-1 gencl:resize-none gencl:bg-transparent",
              "gencl:text-body-1-medium gencl:leading-5 gencl:text-secondary-900 gencl:placeholder:text-secondary-600",
              "gencl:outline-none gencl:disabled:cursor-not-allowed gencl:disabled:opacity-50"
            )}
          />

          <button
            type="submit"
            aria-label="Send"
            disabled={!canSend}
            className={cn(
              "gencl:flex gencl:size-9 gencl:shrink-0 gencl:items-center gencl:justify-center gencl:rounded-full",
              "gencl:bg-blue gencl:text-white gencl:transition-opacity gencl:hover:bg-blue/90",
              "gencl:disabled:cursor-not-allowed gencl:disabled:opacity-40",
              "gencl:focus-visible:outline-none gencl:focus-visible:ring-2 gencl:focus-visible:ring-blue gencl:focus-visible:ring-offset-2"
            )}>
            <ArrowUp aria-hidden="true" className="gencl:size-5" strokeWidth={2.25} />
          </button>
        </div>
      </form>
    );
  }
);
