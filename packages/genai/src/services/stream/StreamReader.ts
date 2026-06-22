/**
 * Reads a streaming HTTP response, splitting concatenated JSON objects per
 * chunk and calling `onChunk` for each parsed JSON string.
 *
 * Returns `{ isCompleted: boolean }` — true when the stream ends normally
 * or when a `response_completed: true` event is seen.
 */
export async function readStream(
  response: Response,
  onChunk: (jsonStr: string) => { isCompleted: boolean; isError: boolean },
  signal?: AbortSignal,
): Promise<{ isCompleted: boolean }> {
  const reader = response.body?.getReader();
  if (!reader) return { isCompleted: false };

  const decoder = new TextDecoder();
  let isCompleted = false;

  try {
    while (true) {
      if (signal?.aborted) break;
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const jsonStrings = splitConcatenatedJson(chunk);

      for (const jsonStr of jsonStrings) {
        if (!jsonStr.trim()) continue;
        const result = onChunk(jsonStr);
        if (result.isCompleted) {
          isCompleted = true;
          break;
        }
        if (result.isError) break;
      }
      if (isCompleted) break;
    }
  } finally {
    reader.releaseLock();
  }

  return { isCompleted };
}

/**
 * Splits a raw chunk string that may contain multiple adjacent JSON objects
 * (e.g. `{"a":1}{"b":2}`) into individual JSON strings.
 * Counts brace depth — fragile against string literals containing braces,
 * but sufficient for the genai SSE stream format.
 */
export function splitConcatenatedJson(chunk: string): string[] {
  const results: string[] = [];
  let depth = 0;
  let start = 0;

  for (let i = 0; i < chunk.length; i++) {
    if (chunk[i] === '{') {
      if (depth === 0) start = i;
      depth++;
    } else if (chunk[i] === '}') {
      depth--;
      if (depth === 0) {
        results.push(chunk.slice(start, i + 1));
      }
    }
  }

  return results;
}
