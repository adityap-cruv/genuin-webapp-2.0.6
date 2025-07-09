"use client";

import { CommandDialog, CommandInput, CommandList } from "@genuin/ui/command";
import { Button } from "@genuin/ui/components/button";
import { ComponentProps, useState, useMemo, useCallback } from "react";
import { Recents } from "./screen/recents";
import { Suggestions } from "./screen/suggestions";
import { SearchResults } from "./screen/search-results";
import { useDebouncedSuggestions } from "./hooks";
import { SEARCH_CONFIG, SEARCH_MODAL_CLASSES } from "./constants";

type SearchModalProps = ComponentProps<typeof CommandDialog> & {
  placeholder?: string;
  onSearch?: (query: string) => void;
  onSeeAll?: () => void;
  variant?: "top";
  contentClassName?: string;
};

export function SearchModal({
  placeholder = "Search...",
  onSearch,
  onSeeAll,
  title = "Search",
  description = "Search...",
  variant = "top",
  ...props
}: SearchModalProps) {
  const [query, setQuery] = useState("");
  const [showFullResults, setShowFullResults] = useState(false);

  // Use debounced suggestions hook with configured delay
  const {
    suggestions,
    isLoading: isSuggestionsLoading,
    isDebouncing,
    error: suggestionsError,
  } = useDebouncedSuggestions(query, SEARCH_CONFIG.DEBOUNCE_DELAY);

  // Memoize filtered suggestions to avoid re-filtering on every render
  const validSuggestions = useMemo(
    () =>
      suggestions.filter(
        (s) =>
          s.type !== undefined &&
          SEARCH_CONFIG.VALID_SUGGESTION_TYPES.includes(s.type as any)
      ),
    [suggestions]
  );

  // Memoize computed values
  const trimmedQuery = query.trim();
  const showSuggestions = trimmedQuery.length >= SEARCH_CONFIG.MIN_QUERY_LENGTH;
  const showRecents = trimmedQuery === "";

  // Reset to suggestions view helper
  const resetToSuggestions = useCallback(() => {
    setShowFullResults(false);
  }, []);

  const handleValueChange = useCallback(
    (value: string) => {
      setQuery(value);
      resetToSuggestions();
      onSearch?.(value);
    },
    [onSearch, resetToSuggestions]
  );

  const handleSearch = useCallback(
    (searchQuery: string) => {
      setQuery(searchQuery);
      resetToSuggestions();
      onSearch?.(searchQuery);
    },
    [onSearch, resetToSuggestions]
  );

  const handleSeeAll = useCallback(() => {
    setShowFullResults(true);
    onSeeAll?.();
  }, [onSeeAll]);

  // Helper component for centered messages
  const CenteredMessage = ({
    children,
    className = "",
  }: {
    children: React.ReactNode;
    className?: string;
  }) => (
    <div className={SEARCH_MODAL_CLASSES.CENTERED_MESSAGE}>
      <div className={`gencl:text-sm ${className}`}>{children}</div>
    </div>
  );

  return (
    <CommandDialog
      defaultOpen
      title={title}
      description={description}
      variant={variant}
      contentClassName="gencl:max-h-[80vh] gencl:min-h-[500px] gencl:flex gencl:flex-col gencl:w-full sm:gencl:w-[40vw] md:gencl:w-[36vw] lg:gencl:w-[32vw] gencl:max-w-xl sm:gencl:max-w-none"
      showClose={true}
      {...props}
    >
      <CommandInput
        placeholder={placeholder}
        value={query}
        onValueChange={handleValueChange}
        className="gencl:border-secondary-600 gencl:flex-shrink-0"
      />

      {/* Conditional rendering based on state */}
      {showFullResults && showSuggestions ? (
        // Show full search results when "See All" is clicked
        <SearchResults
          query={query}
          className="gencl:flex-1 gencl:overflow-hidden gencl:overflow-y-auto gencl:min-h-0"
        />
      ) : (
        <div className="gencl:flex gencl:flex-col gencl:flex-1 gencl:overflow-hidden gencl:min-h-0">
          <CommandList className="gencl:flex-1 gencl:overflow-y-auto gencl:min-h-0 gencl:max-h-none!">
            {showRecents ? (
              // Show recents when no search query
              <Recents onSearch={handleSearch} />
            ) : showSuggestions ? (
              // Show suggestions when user has typed at least minimum characters
              <>
                {suggestionsError ? (
                  <CenteredMessage className="gencl:text-red-500">
                    Failed to load suggestions. Please try again.
                  </CenteredMessage>
                ) : (
                  <Suggestions
                    suggestions={validSuggestions}
                    searchQuery={trimmedQuery}
                    isLoading={isSuggestionsLoading || isDebouncing}
                    className="gencl:mb-10"
                  />
                )}
              </>
            ) : (
              // Show empty state for queries less than minimum characters
              <CenteredMessage className="gencl:text-muted-foreground">
                Type at least {SEARCH_CONFIG.MIN_QUERY_LENGTH} characters to
                search
              </CenteredMessage>
            )}
          </CommandList>

          {/* See All Button - Fixed at bottom, outside scrollable area */}
          {showSuggestions && validSuggestions.length > 0 && (
            <div className="gencl:flex-shrink-0 gencl:p-1 gencl:border-t gencl:border-secondary-200 gencl:bg-white gencl:absolute gencl:bottom-0 gencl:left-0 gencl:right-0 gencl:z-10">
              <Button
                variant="default"
                theme="text"
                size="sm"
                className="gencl:w-full gencl:text-body-1-semi-bold gencl:border-secondary-900"
                onClick={handleSeeAll}
              >
                See all results
              </Button>
            </div>
          )}
        </div>
      )}
    </CommandDialog>
  );
}
