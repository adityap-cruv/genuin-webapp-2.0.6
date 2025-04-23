import { z } from 'zod'

export const CommunityUserRoleSchema = z.union([
  z.literal('LEADER'),
  z.literal('MEMBER'),
  z.literal('REQUESTED'),
  z.literal('MODERATOR'),
  z.literal('UNJOINED'),
])

export type CommunityUserRoleType = z.infer<typeof CommunityUserRoleSchema>
