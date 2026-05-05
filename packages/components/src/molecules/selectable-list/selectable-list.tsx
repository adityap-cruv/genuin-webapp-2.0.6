import { cn } from "@genuin/ui/lib/utils";
import type { ComponentProps } from "react";
import { createContext, useContext, useState, useRef, useEffect, type ReactNode, type KeyboardEvent } from "react";

type SelectableListContextType = {
  highlightedIndex: number;
  setHighlightedIndex: (i: number) => void;
  itemCount: number;
};

const SelectableListContext = createContext<SelectableListContextType | null>(null);

export function useSelectableList() {
  const ctx = useContext(SelectableListContext);
  if (!ctx) throw new Error("SelectableList.Item must be used within SelectableList");
  return ctx;
}

type SelectableListProps = {
  children: ReactNode;
  className?: string;
};

function SelectableList({ children, className }: SelectableListProps) {
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  // Count children for navigation
  const itemCount = Array.isArray(children) ? children.length : 1;

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowDown") {
      setHighlightedIndex((prev) => (prev + 1) % itemCount);
      e.preventDefault();
    } else if (e.key === "ArrowUp") {
      setHighlightedIndex((prev) => (prev - 1 + itemCount) % itemCount);
      e.preventDefault();
    }
  };

  useEffect(() => {
    const el = listRef.current?.children[highlightedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex]);

  return (
    <SelectableListContext.Provider value={{ highlightedIndex, setHighlightedIndex, itemCount }}>
      <div
        tabIndex={0}
        onKeyDown={handleKeyDown}
        className={cn(
          "gencl:w-full gencl:rounded-lg gencl:border gencl:border-secondary-150 gencl:overflow-y-auto gencl:max-h-60 gencl:px-3 gencl:py-2",
          className
        )}>
        <ul ref={listRef}>{children}</ul>
      </div>
    </SelectableListContext.Provider>
  );
}

type SelectableItemProps = {
  children: ReactNode;
  index: number;
  className?: string;
  [key: string]: any;
} & ComponentProps<"li">;

function Item({ children, index, className, ...rest }: SelectableItemProps) {
  const { highlightedIndex, setHighlightedIndex } = useSelectableList();
  return (
    <li
      className={cn(
        "gencl:px-2 gencl:py-1 gencl:cursor-pointer gencl:rounded-lg gencl:text-body-1-medium",
        index === highlightedIndex && "gencl:bg-secondary-50",
        className
      )}
      onMouseEnter={() => setHighlightedIndex(index)}
      {...rest}>
      {children}
    </li>
  );
}

SelectableList.Item = Item;

export { SelectableList };
