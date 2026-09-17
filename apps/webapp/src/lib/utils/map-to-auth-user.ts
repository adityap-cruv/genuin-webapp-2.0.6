import type { AuthUser } from "@genuin/components/types/auth";
import { parseKsCbRequestStatus } from "@genuin/components/types/roles";
import type { User as NextAuthUser } from "next-auth";

/**
 * Map a NextAuth session user (WebApp) to the SDK/components `AuthUser` shape,
 * so it can be handed to `genuin.setUser()` for a zero-API session hand-off.
 */
export function mapToAuthUser(sessionUser: NextAuthUser): AuthUser {
  return {
    id: sessionUser.id,
    bio: sessionUser.bio,
    email: sessionUser.email ?? undefined,
    phoneNumber: sessionUser.phoneNumber,
    isAvatar: sessionUser.isAvatar,
    name: sessionUser.name ?? "",
    nickname: sessionUser.nickname,
    image: sessionUser.image ?? "",
    accessToken: sessionUser.accessToken,
    refreshToken: sessionUser.refreshToken,
    ksCbRequestStatus: parseKsCbRequestStatus(sessionUser.ksCbRequestStatus),
    isBrandSystemUser: sessionUser.isBrandSystemUser,
    brandId: sessionUser.brandId,
    brandSlug: sessionUser.brandSlug,
    hasTopics: sessionUser.hasTopics,
    birth: sessionUser.birth,
    usernameSet: sessionUser.usernameSet,
  };
}
