import { z } from "zod";

export const GroupUserStatusSchema = z.union([z.literal("UNJOINED"), z.literal("REQUESTED"), z.literal("JOINED")]);

/**
 * Group User join status, if user has not joined the group, requested to join, or is an active member.
 */
export type GroupUserStatusType = z.infer<typeof GroupUserStatusSchema>;

export const ksCbRequestStatusSchema = z.union([
  z.literal("Pending"),
  z.literal("Requested"),
  z.literal("Accepted"),
  z.literal("Success"),
]);

export type ksCbRequestStatusType = z.infer<typeof ksCbRequestStatusSchema>;

/**
 * The context a KS-CB request status is being interpreted in. The numeric value
 * `3` means different things depending on where it came from:
 * - `"user"` (login / user payload, field `ks_cb_request_status`): `3 → "Success"`
 *   — a settled creator.
 * - `"becomeCreator"` (become-creator status poll, field `cb_request_status`):
 *   `3 → "Accepted"` — a fresh approval that should trigger the celebration UI.
 */
export type KsCbStatusContext = "user" | "becomeCreator";

/**
 * Single source of truth for mapping a raw KS-CB request status (numeric `1|2|3`
 * from the API, or an already-mapped enum string) to {@link ksCbRequestStatusType}.
 *
 * Shared numeric mapping: `1 → Pending`, `2 → Requested`. The value `3` (and any
 * other number) is context-dependent — see {@link KsCbStatusContext}. Inputs that
 * are already valid enum strings pass through unchanged.
 *
 * @param context defaults to `"user"` (the login / general flow).
 */
export function parseKsCbRequestStatus(
  status: number | string | undefined | null,
  context: KsCbStatusContext = "user"
): ksCbRequestStatusType {
  if (status === 1 || status === "Pending") return "Pending";
  if (status === 2 || status === "Requested") return "Requested";
  if (status === "Accepted") return "Accepted";
  if (status === "Success") return "Success";
  return context === "becomeCreator" ? "Accepted" : "Success";
}
