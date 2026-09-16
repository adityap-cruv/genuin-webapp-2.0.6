import type { AuthUser } from "@genuin/components/types/auth";
import type { ksCbRequestStatusType } from "@genuin/components/types/roles";
import type { User as NextAuthUser } from "next-auth";

/**
 * Map the numeric/string NextAuth `ksCbRequestStatus` to the SDK enum.
 * Mirrors `mapKsCbStatus` in auth-bridge.tsx and `KsCbStatus` in the shared parser.
 */
function mapKsCbStatus(status: number | string): ksCbRequestStatusType {
  if (status === 1 || status === "Pending") return "Pending";
  if (status === 2 || status === "Requested") return "Requested";
  if (status === 3 || status === "Success") return "Success";
  return "Accepted";
}

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
    ksCbRequestStatus: mapKsCbStatus(sessionUser.ksCbRequestStatus),
    isBrandSystemUser: sessionUser.isBrandSystemUser,
    brandId: sessionUser.brandId,
    brandSlug: sessionUser.brandSlug,
    hasTopics: sessionUser.hasTopics,
    birth: sessionUser.birth,
    usernameSet: sessionUser.usernameSet,
  };
}
