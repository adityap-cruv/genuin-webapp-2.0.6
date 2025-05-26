import { z } from "zod";

export const FeedTypeSchema = z.union([
  z.literal("HOME"),
  z.literal("LATEST"),
  z.literal("POPULAR"),
]);

export type FeedType = z.infer<typeof FeedTypeSchema>;

export const CommunityUserRoleSchema = z.union([
  z.literal("LEADER"),
  z.literal("MEMBER"),
  z.literal("REQUESTED"),
  z.literal("MODERATOR"),
  z.literal("UNJOINED"),
]);

export type CommunityUserRole = z.infer<typeof CommunityUserRoleSchema>;
