/**
 * Search modal configuration constants
 */
export const SEARCH_CONFIG = {
  MIN_QUERY_LENGTH: 2,
  DEBOUNCE_DELAY: 300,
  VALID_SUGGESTION_TYPES: ["video", "user", "community", "loop"] as const,
  SKELETON_COUNTS: {
    SUGGESTIONS: 5,
    RECENTS: 6,
    SEARCH_RESULTS: 5,
  },
} as const;

/**
 * Shared CSS classes for search modal components
 */
export const SEARCH_MODAL_CLASSES = {
  CENTERED_MESSAGE:
    "gencl:flex gencl:items-center gencl:justify-center gencl:py-6",
} as const;
