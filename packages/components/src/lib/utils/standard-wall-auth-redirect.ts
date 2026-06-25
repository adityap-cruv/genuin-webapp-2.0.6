import type { AuthCallbackDataType } from "@genuin/components/context/auth/context";
import type { EmbedDataType } from "@genuin/components/context/embed/embed.types";
import type { BrandDetailsConfigType } from "@genuin/components/types/brand";

type TriggerStandardWallRedirectParams = {
  authCallbackData: AuthCallbackDataType;
  embedData: EmbedDataType | null | undefined;
  brandDetails: BrandDetailsConfigType | null | undefined;
  urlToOpen?: string;
};

export function triggerStandardWallRedirect({
  authCallbackData,
  embedData,
  brandDetails,
  urlToOpen,
}: TriggerStandardWallRedirectParams): void {
  // Priority: sign-in URL → sign-up URL → host callback → whitelabel fallback.

  // 1. Per-embed configured sign-in URL, if any.
  const signInUrl = typeof embedData?.authInfo?.signInUrl === "string" ? embedData.authInfo.signInUrl : undefined;
  if (signInUrl) {
    window.open(signInUrl, "_blank");
    return;
  }

  // 2. Per-embed configured sign-up URL, if any.
  const signUpUrl = typeof embedData?.authInfo?.signUpUrl === "string" ? embedData.authInfo.signUpUrl : undefined;
  if (signUpUrl) {
    window.open(signUpUrl, "_blank");
    return;
  }

  // 3. Host auth callback — only invoke when running in a browser AND the host
  // actually registered a callable genuinAuth (guards SSR / missing / non-function).
  if (typeof window !== "undefined" && window.genuinAuth && typeof window.genuinAuth === "function") {
    window.genuinAuth(authCallbackData);
    return;
  }

  // 4. Whitelabel fallback — resolve the action's path against white_label_url.
  const target = urlToOpen ?? authCallbackData.path ?? "/";
  if (brandDetails?.white_label_url) {
    window.open(new URL(target, brandDetails.white_label_url).href, "_blank");
  }
}
