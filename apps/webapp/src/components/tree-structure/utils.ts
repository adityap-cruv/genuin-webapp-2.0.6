export enum CommunityUserRole {
  LEADER = 'LEADER',
  MEMBER = 'MEMBER',
  REQUESTED = 'REQUESTED',
  MODERATOR = 'MODERATOR',
  UNJOINED = 'UNJOINED',
}

/*
 * This function maps the role of the user in the community.
 * @param role - Role of the user in the community.
 * @param isRequested - If the user has requested to join the community.
 */
export function mapCommunityUserRole(role?: number | null, isRequested?: boolean | null): CommunityUserRole {
  if (isRequested) return CommunityUserRole.REQUESTED

  switch (role) {
    case 1:
      return CommunityUserRole.LEADER
    case 2:
      return CommunityUserRole.MEMBER
    case 3:
      return CommunityUserRole.MODERATOR
    default:
      return CommunityUserRole.UNJOINED
  }
}

/**
 * This function maps the community user role back to its numeric representation.
 * @param role - The user's role in the community.
 * @returns The numeric representation of the role, or `null` if unjoined/requested.
 */
export function reverseMapCommunityUserRole(role: CommunityUserRole): {
  role: number | undefined
  isRequested: boolean
} {
  if (role === CommunityUserRole.REQUESTED) {
    return { role: undefined, isRequested: true }
  }

  const roleMap: Record<CommunityUserRole, number | undefined> = {
    [CommunityUserRole.LEADER]: 1,
    [CommunityUserRole.MEMBER]: 2,
    [CommunityUserRole.MODERATOR]: 3,
    [CommunityUserRole.UNJOINED]: undefined,
    [CommunityUserRole.REQUESTED]: undefined, // Redundant, but for completeness
  }

  return { role: roleMap[role], isRequested: false }
}

/**
 * To figure out how much videos elements needs to be fetched.
 * @param hasPageParam - If the next page is being called.
 * @returns
 */
export function getVideoLimit(hasPageParam: boolean, isMobile: boolean) {
  // If the user is on mobile, fetch 3 videos for the first page and 6 for the next page.
  // If the user is on desktop, fetch 8 videos for the first page and 16 for the next page.
  if (isMobile) {
    return hasPageParam ? 6 : 3
  } else {
    return hasPageParam ? 16 : 8
  }
}
