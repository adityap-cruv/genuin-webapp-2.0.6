/**
 * TagDetailsGate — gates `children` on the tag config resolving.
 *
 * Reads `useTagDetails()`, which throws outside a `TagDetailsProvider`, so
 * this must be mounted inside one. `children` only ever renders once
 * `tagDetails` is defined and the fetch hasn't failed — callers do not need
 * their own loading/error branch.
 *
 * Default-exported (rather than named) so callers can `lazy()`-load it.
 */
import type { ReactNode } from "react";

import { FeedSkeleton } from "@cxr/app/FeedSkeleton";
import { NoContent } from "@cxr/app/NoContent";
import { useTagDetails } from "@cxr/providers/TagDetailsProvider";

export default function TagDetailsGate({ children }: { children: ReactNode }): ReactNode {
  const { tagDetails, apiFailed } = useTagDetails();

  if (apiFailed) {
    return <NoContent message="This content is no longer available" />;
  }
  if (!tagDetails) {
    return <FeedSkeleton />;
  }
  return children;
}
