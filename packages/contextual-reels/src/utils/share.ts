import { createLogger } from "@cxr/utils/logger";

const logger = createLogger("cxr/share");

/**
 * Copies a URL to the clipboard, falling back to a hidden textarea + `execCommand`
 * when the async Clipboard API is unavailable (non-secure contexts, older browsers).
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (!text) return;

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch (error) {
      logger.warn("navigator.clipboard.writeText failed, falling back", error);
    }
  }

  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  try {
    document.execCommand("copy");
  } catch (error) {
    logger.warn("execCommand('copy') failed", error);
  } finally {
    document.body.removeChild(textarea);
  }
}

/** Opens a share/profile URL in a new tab. No-op when `url` is empty. */
export function openShareLink(url: string | undefined): void {
  if (!url) return;
  window.open(url, "_blank", "noopener,noreferrer");
}
