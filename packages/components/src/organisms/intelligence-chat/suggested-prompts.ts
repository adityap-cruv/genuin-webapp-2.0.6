// ── Intelligence chat transport ─────────────────────────────────────────────────────────────
const INTELLIGENCE_CHAT_URL =
  (import.meta as ImportMeta & { env?: Record<string, string | undefined> }).env?.VITE_INTELLIGENCE_CHAT_URL ??
  "/api/intelligence/chat";

export const CLIENT_PROMPT_CACHE = new Map<string, string[]>();
const IN_FLIGHT_CACHE = new Map<string, Promise<string[]>>();

export async function fetchVideoSuggestedPrompts(
  videoId: string,
  title?: string,
  description?: string,
  signal?: AbortSignal
): Promise<string[]> {
  if (!videoId) return [];
  const cached = CLIENT_PROMPT_CACHE.get(videoId);
  if (cached && cached.length > 0) return cached;

  const inFlight = IN_FLIGHT_CACHE.get(videoId);
  if (inFlight) return inFlight;

  const promise = (async () => {
    try {
      const params = new URLSearchParams({ videoId });
      if (title) params.set("title", title);
      if (description) params.set("description", description);
      const res = await fetch(`${INTELLIGENCE_CHAT_URL}?${params.toString()}`, { signal });
      if (!res.ok) return [];
      const data = (await res.json()) as { prompts?: string[] };
      const prompts = data.prompts ?? [];
      if (prompts.length > 0) {
        CLIENT_PROMPT_CACHE.set(videoId, prompts);
      }
      return prompts;
    } catch {
      return [];
    } finally {
      IN_FLIGHT_CACHE.delete(videoId);
    }
  })();

  IN_FLIGHT_CACHE.set(videoId, promise);
  return promise;
}
