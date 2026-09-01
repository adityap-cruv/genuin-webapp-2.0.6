/**
 * Typed document events shared by Home and the SDK expand-view React root.
 *
 * Home and the expanded player intentionally live in separate React roots. These
 * events carry presentation requests across that boundary without coupling either
 * root to the other's state container or creating another player instance.
 */
export const HOME_FULL_VIEW_EVENT = "genuin:home-feed-full-view";
export const HOME_FEED_VIEW_EVENT = "genuin:home-feed-view";
export const HOME_INLINE_ARTICLE_STATE_EVENT = "genuin:home-feed-inline-article-state";

export type HomeInlineArticleStateDetail = {
  sourceDomId: string;
  open: boolean;
};

export function dispatchHomeInlineArticleState(detail: HomeInlineArticleStateDetail): void {
  document.dispatchEvent(new CustomEvent<HomeInlineArticleStateDetail>(HOME_INLINE_ARTICLE_STATE_EVENT, { detail }));
}
