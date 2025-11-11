/**
 * A utility function to generate query parameters string from a URL and additional parameters
 */

/**
 * Valid action types for query parameters
 */
export type ActionType =
  | "spark"
  | "comment-spark"
  | "repost"
  | "comment"
  | "report"
  | "join-community"
  | "join-group"
  | "subscribe-group"
  | "become-a-creator"
  | "iheart-follow";

/**
 * Parameters for creating query parameters
 */
export type QueryParamsOptions = {
  /** The base URL to extract and extend query parameters from */
  url: string | undefined;
  /** The action parameter to add to the query ('spark', 'comment-spark', or 'repost') */
  action?: ActionType;
  /** Additional parameters to add to the query as key-value pairs */
  additionalParams?: Record<string, string | undefined>;
};

/**
 * Creates a query parameters string from a URL and additional parameters
 * @param options - Configuration options for creating query parameters
 * @returns A string of query parameters without the leading '?'
 */
export function createReturnQueryParams(options: QueryParamsOptions): string {
  try {
    const { url, action, additionalParams } = options;

    if (typeof url === "string") {
      const urlObj = new URL(url);

      // Add action parameter if provided
      if (action) {
        urlObj.searchParams.set("action", action);
      }

      // Add all additional parameters
      if (additionalParams) {
        Object.entries(additionalParams).forEach(([key, value]) => {
          if (value) {
            urlObj.searchParams.set(key, value);
          }
        });
      }

      return urlObj.search.substring(1); // Remove the leading '?'
    }
    return "";
  } catch (e) {
    return "";
  }
}
