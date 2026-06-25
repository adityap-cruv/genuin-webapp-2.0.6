import { AD_LAYOUT, type AdLayoutId } from "@cxr/config";

/** Returns true for compact ad layouts that need the compact control bar. */
export function isCompactLayout(adLayout: AdLayoutId): boolean {
  return adLayout === AD_LAYOUT.L3 || adLayout === AD_LAYOUT.L4;
}
