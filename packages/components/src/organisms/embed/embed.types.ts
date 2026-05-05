import type { ComponentProps } from "react";

import type { FeedPage } from "@genuin/components/react-query/api/feed/feed";

export type EmbedProps = ComponentProps<"div"> & {
  feedData?: {
    pages: FeedPage[];
    pageParams?: any[];
  };
  wasLazilyLoaded?: boolean;
  isOnlyForExpand?: boolean;
};
