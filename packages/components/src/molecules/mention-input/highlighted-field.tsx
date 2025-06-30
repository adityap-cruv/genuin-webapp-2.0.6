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
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value?: string;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  selectedMentions?: SelectedMention[];
  classes?: {
    input?: string;
    highlight?: string;
  };
}

const HighlightedInput = forwardRef<HTMLInputElement, HighlightedInputProps>(
  (
    {
      value = "",
      onChange,
      placeholder = "",
      className = "",
      selectedMentions = [],
      classes = {},
      ...props
    },
    ref
  ) => {
    const [inputValue, setInputValue] = useState<string>(value);
    const inputRef = useRef<HTMLInputElement>(null);
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

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>): void => {
      const newValue = e.target.value;
      setInputValue(newValue);

      if (onChange) {
        onChange(e);
      }
    };

    const handleScroll = (e: React.UIEvent<HTMLInputElement>): void => {
      if (highlightRef.current) {
        const target = e.target as HTMLInputElement;
        highlightRef.current.scrollLeft = target.scrollLeft;
        highlightRef.current.scrollTop = target.scrollTop;
      }
    };

    const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>): void => {
      const target = e.target as HTMLInputElement;
    };

    const handleClick = (e: React.MouseEvent<HTMLInputElement>): void => {
      const target = e.target as HTMLInputElement;
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
      <div className={`gencl:relative ${className}`}>
        {/* Highlight layer */}
        <div
          ref={highlightRef}
          className={cn(
            "gencl:absolute gencl:top-0 gencl:left-0 gencl:w-full gencl:h-full gencl:pointer-events-none gencl:overflow-hidden gencl:whitespace-pre-wrap gencl:z-0 gencl:leading-normal gencl:border gencl:border-transparent gencl:rounded-md",
            classes.highlight
          )}
          dangerouslySetInnerHTML={{ __html: getHighlightedText() }}
        />

        {/* Input field */}
        <input
          ref={ref || inputRef}
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onScroll={handleScroll}
          onKeyUp={handleKeyUp}
          onClick={handleClick}
          placeholder={placeholder}
          className={cn(
            "gencl:w-full gencl:caret-secondary-500 gencl:border gencl:border-gray-300 gencl:rounded-md gencl:focus:outline-none gencl:focus:ring-2 gencl:focus:ring-blue-500 gencl:focus:border-transparent gencl:bg-transparent gencl:relative gencl:z-10 gencl:text-transparent gencl:overflow-x-auto gencl:selection:bg-blue-200",
            classes.input
          )}
          {...props}
        />
      </div>
    );
  }
);

export default HighlightedInput;
