import type { SlotKind } from "./types";

/**
 * Three slot kinds: video, linkout, and ai-response. The slot name
 * decides:
 *
 * - Anything containing `"ai response"` → `ai-response` (renders
 *   the placeholder `<AiResponse>` text + carousel block).
 * - Anything containing `"video"` → `video` (renders
 *   `<DynamicLinkouts view="embed">` + a video backdrop).
 * - Everything else → `linkout` (renders
 *   `<DynamicLinkouts view="responsive">` — the wide responsive
 *   card).
 *
 * Order matters: the ai-response check runs first so a hypothetical
 * "AI Video Response" name would still resolve to ai-response.
 *
 * See HIERARCHICAL_GRID_PLAN.md § 5.
 */
export function slotKind(name: string): SlotKind {
  const n = name.toLowerCase();
  if (n.includes("ai response") || n.includes("ai-response")) return "ai-response";
  if (n.includes("video")) return "video";
  return "linkout";
}
