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

export const ksCbRequestStatusSchema = z.union([
  z.literal("Pending"),
  z.literal("Requested"),
  z.literal("Accepted")
]);

export type ksCbRequestStatusType  = z.infer<typeof ksCbRequestStatusSchema>;