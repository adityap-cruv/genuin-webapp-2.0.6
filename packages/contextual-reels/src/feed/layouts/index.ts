/**
 * Public API for the layouts folder.
 *
 * Re-exports the two layout components so consumers can import from '@cxr/feed/layouts/layouts'
 * without knowing which file each component lives in.
 */

export { VideoLayout } from "@cxr/feed/layouts/VideoLayout";
export type { VideoLayoutProps } from "@cxr/feed/layouts/VideoLayout";

export { AdLayout } from "@cxr/feed/layouts/AdLayout";
export type { AdLayoutProps } from "@cxr/feed/layouts/AdLayout";
