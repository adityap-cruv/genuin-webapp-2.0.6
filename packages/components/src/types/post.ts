import { z } from "zod";

export const FeedTypeSchema = z.union([
  z.literal("HOME"),
  z.literal("LATEST"),
  z.literal("POPULAR"),
  z.literal("EMBED_HOME"),
  z.literal("PLACEMENT_SECTIONS"),
  z.literal("SECTION_FEED"),
  z.literal("VIDEO"),
  z.literal("FEED_V1"),
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
