/**
 * TagDetailsProvider — owns the resolved tag config and exposes it via
 * context. Rendering the loading skeleton / error state / `children` based
 * on that state is {@link TagDetailsGate}'s job, not this provider's — see
 * that file for the gating behavior.
 *
 * Responsibilities:
 *  1. Load tag config via useTagLoader (tagId/rootTagId/previewConfig/adLayout).
 *  2. Expose useTagDetails() hook with tagDetails, apiFailed, and the widget's
 *     Shadow DOM topology (shadowConfig).
 */
import { createContext, useContext, useMemo, type ReactNode } from "react";

import { useTagLoader } from "@cxr/app/useTagLoader";
import type { AdLayoutId } from "@cxr/config";
import type { ShadowDomConfig } from "@cxr/shadow-dom-config";
import type { TagResponse } from "@cxr/types";

/** Context value exposed via useTagDetails. */
export interface TagDetailsContextValue {
  /** Resolved tag config, or undefined until the fetch resolves. */
  tagDetails: TagResponse | undefined;
  /** True if the tag fetch rejected. */
  apiFailed: boolean;
  /** Tag id this provider was mounted with. */
  tagId: string;
  /** Active tag's `brand_id` (from `tagDetails`), once resolved. */
  brandId: number | undefined;
  /** Ad layout this provider was mounted with. */
  adLayout: AdLayoutId;
  /** Active Shadow DOM topology for this widget instance, or null in direct mode. */
  shadowConfig: ShadowDomConfig | null;
}

const TagDetailsContext = createContext<TagDetailsContextValue | undefined>(undefined);

interface TagDetailsProviderProps {
  children: ReactNode;
  tagId: string;
  rootTagId: string;
  /** Full client-supplied tag config for dashboard preview (bypasses getTag). */
  previewConfig?: TagResponse;
  /** Preview mode — suppresses the getTag fetch even before previewConfig lands. */
  preview?: boolean;
  adLayout: AdLayoutId;
  /** Pass null when the widget is mounted in direct (non-shadow) mode. */
  shadowConfig?: ShadowDomConfig | null;
}

/**
 * TagDetailsProvider — loads the tag config once, exposes it via
 * useTagDetails, and gates `children` behind it resolving.
 *
 * `children` renders unconditionally — wrap it in {@link TagDetailsGate} to
 * gate on `tagDetails` resolving.
 *
 * @example
 * ```tsx
 * <TagDetailsProvider tagId={tagId} rootTagId={rootTagId} previewConfig={previewConfig} adLayout={adLayout}>
 *   <TagDetailsGate>
 *     <FullScreenProvider brandId={tagDetails.brand_id}>...</FullScreenProvider>
 *   </TagDetailsGate>
 * </TagDetailsProvider>
 * ```
 */
export function TagDetailsProvider({
  children,
  tagId,
  rootTagId,
  previewConfig,
  preview,
  adLayout,
  shadowConfig = null,
}: TagDetailsProviderProps): ReactNode {
  const { tagDetails, apiFailed } = useTagLoader({ tagId, rootTagId, previewConfig, preview, adLayout });
  const value = useMemo<TagDetailsContextValue>(
    () => ({ tagDetails, apiFailed, tagId, brandId: tagDetails?.brand_id, adLayout, shadowConfig }),
    [tagDetails, apiFailed, tagId, adLayout, shadowConfig]
  );

  return <TagDetailsContext.Provider value={value}>{children}</TagDetailsContext.Provider>;
}

/**
 * Hook accessor for the tag details context.
 *
 * @throws Error when called outside a {@link TagDetailsProvider}.
 */
export function useTagDetails(): TagDetailsContextValue {
  const ctx = useContext(TagDetailsContext);
  if (!ctx) {
    throw new Error("useTagDetails must be used inside <TagDetailsProvider>");
  }
  return ctx;
}
