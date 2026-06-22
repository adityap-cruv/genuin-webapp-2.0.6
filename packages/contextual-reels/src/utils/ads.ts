/** Returns true for compact ad layouts that need the compact control bar. */
export function isCompactLayout(adLayout: string): boolean {
  return adLayout === "mobile-320x50" || adLayout === "mobile-320x100";
}
