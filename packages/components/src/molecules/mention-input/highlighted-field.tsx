import { cn } from "@genuin/ui/lib/utils";
import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  InputHTMLAttributes,
  ChangeEvent,
} from "react";

// Import the SelectedMention type
export type SelectedMention = {
  handle: string;
  id: string | number;
  slug?: string;
  type: "member" | "community" | "url";
};

interface HighlightedInputProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement | HTMLTextAreaElement>,
    "onChange"
  > {
  value?: string;
  onChange?: (
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  selectedMentions?: SelectedMention[];
  name: string;
  classes?: {
    input?: string;
    highlight?: string;
  };
  inputType: "text" | "textarea";
}

const HighlightedInput = forwardRef<
  HTMLInputElement | HTMLTextAreaElement,
  HighlightedInputProps
>(
  (
    {
      value = "",
      onChange,
      placeholder = "",
      className = "",
      name = "",
      selectedMentions = [],
      classes = {},
      inputType = "text",
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState<string>(value);
    const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
    const highlightRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      setInputValue(value);
    }, [value]);

    useEffect(() => {
      // Sync scroll position between input and highlight layer
      if (inputRef.current && highlightRef.current) {
        highlightRef.current.scrollLeft = inputRef.current.scrollLeft;
        highlightRef.current.scrollTop = inputRef.current.scrollTop;
      }
    }, [inputValue]);

    const handleInputChange = (
      e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ): void => {
      const newValue = e.target.value;
      setInputValue(newValue);

      if (onChange) {
        // Create a synthetic event with the current target to ensure proper event handling
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: newValue,
          },
        } as ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

        onChange(syntheticEvent);
      }
    };

    const handleScroll = (
      e: React.UIEvent<HTMLInputElement | HTMLTextAreaElement>
    ): void => {
      if (highlightRef.current) {
        const target = e.target as HTMLInputElement | HTMLTextAreaElement;
        highlightRef.current.scrollLeft = target.scrollLeft;
        highlightRef.current.scrollTop = target.scrollTop;
      }
    };

    // Helper to escape regex special characters
    const escapeRegExp = (string: string) =>
      string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Build a regex to match only the selected mentions' handles (with or without @)
    const getMentionsRegex = () => {
      if (!selectedMentions.length) return null;
      // Allow both @handle and handle
      const patterns = selectedMentions.map((mention) => {
        const handle = mention.handle.startsWith("@")
          ? mention.handle.slice(1)
          : mention.handle;
        return `@?${escapeRegExp(handle)}`;
      });
      // Word boundary or start/end of string
      return new RegExp(`(${patterns.join("|")})`, "gi");
    };

    // Replace spaces with &nbsp; for highlight layer
    const preserveSpaces = (text: string) =>
      text.replace(/  /g, " &nbsp;").replace(/ /g, "&nbsp;");

    const getHighlightedText = (): string => {
      if (!inputValue) {
        // Show placeholder in highlight layer if input is empty
        if (placeholder) {
          return `<span class=\"gencl:text-secondary-600 gencl:opacity-100\">${preserveSpaces(placeholder)}</span>`;
        }
        return "";
      }
      const regex = getMentionsRegex();
      if (!regex) {
        return `<span class=\"gencl:text-black\">${preserveSpaces(inputValue)}</span>`;
      }
      let lastIndex = 0;
      let result = "";
      let match;
      while ((match = regex.exec(inputValue)) !== null) {
        const start = match.index;
        const end = regex.lastIndex;
        // Add text before match
        result += preserveSpaces(inputValue.slice(lastIndex, start));
        // Add highlighted match
        result += `<span class=\"gencl:text-primary\">${preserveSpaces(match[0])}</span>`;
        lastIndex = end;
      }
      // Add remaining text
      result += preserveSpaces(inputValue.slice(lastIndex));
      return `<span class=\"gencl:text-black\">${result}</span>`;
    };

    return (
      <>
        {inputType === "text" ? (
          <div className={`gencl:relative ${className}`}>
            {/* Highlight layer */}
            <div
              ref={highlightRef}
              className={cn(
                "gencl:absolute gencl:top-0 gencl:left-0 gencl:w-full gencl:h-full gencl:pointer-events-none gencl:overflow-auto gencl:whitespace-pre-wrap gencl:z-0 gencl:border gencl:border-transparent gencl:rounded-md",
                classes.highlight
              )}
              style={{
                scrollbarWidth: "none",
                msOverflowStyle: "none",
                WebkitOverflowScrolling: "touch",
                transform: "translateZ(0)", // Force hardware acceleration for iOS
              }}
              dangerouslySetInnerHTML={{ __html: getHighlightedText() }}
            />
            <input
              ref={
                (ref as React.Ref<HTMLInputElement>) ||
                (inputRef as React.RefObject<HTMLInputElement>)
              }
              type="text"
              name={name}
              value={inputValue}
              onChange={handleInputChange}
              onScroll={handleScroll}
              className={cn(
                "gencl:w-full gencl:caret-secondary-500 gencl:rounded-md gencl:focus:outline-none gencl:ring-0! gencl:focus:border-transparent gencl:bg-transparent gencl:relative gencl:z-10 gencl:text-transparent gencl:overflow-x-auto",
                classes.input
              )}
              style={{
                WebkitOverflowScrolling: "touch",
                transform: "translateZ(0)", // Force hardware acceleration for iOS
                WebkitAppearance: "none", // Remove iOS Safari input styling
              }}
              {...props}
            />
          </div>
        ) : (
          <textarea
            placeholder="Add description"
            ref={
              (ref as React.RefObject<HTMLTextAreaElement>) ||
              (inputRef as React.RefObject<HTMLTextAreaElement>)
            }
            name={name}
            value={inputValue}
            onChange={handleInputChange}
            onScroll={handleScroll}
            className={cn(
              "gencl:w-full gencl:caret-secondary-500 gencl:rounded-md gencl:focus:border-transparent gencl:bg-transparent gencl:relative gencl:z-10 gencl:overflow-y-auto gencl:selection:bg-blue-200 gencl:focus-visible:outline-hidden",
              classes.input
            )}
            style={{
              WebkitOverflowScrolling: "touch",
              transform: "translateZ(0)", // Force hardware acceleration for iOS
              WebkitAppearance: "none", // Remove iOS Safari textarea styling
            }}
            rows={5}
            {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        )}
      </>
    );
  }
);

export default HighlightedInput;
