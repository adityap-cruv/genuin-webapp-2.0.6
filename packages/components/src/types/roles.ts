import { z } from "zod";

export const GroupUserStatusSchema = z.union([
  z.literal("UNJOINED"),
  z.literal("REQUESTED"),
  z.literal("JOINED"),
]);

/**
 * Group User join status, if user has not joined the group, requested to join, or is an active member.
 */
export type GroupUserStatusType = z.infer<typeof GroupUserStatusSchema>;
