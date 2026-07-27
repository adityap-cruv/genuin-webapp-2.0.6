const GENAI_SDK_STYLES_URL = "https://media.begenuin.com/genai-sdk/genai-sdk.css";

export async function GET() {
  const response = await fetch(GENAI_SDK_STYLES_URL, {
    next: { revalidate: 86400 },
  });

  if (!response.ok) {
    return new Response("/* GenAI SDK stylesheet unavailable. */", {
      status: response.status,
      headers: { "content-type": "text/css; charset=utf-8" },
    });
  }

  return new Response(response.body, {
    headers: {
      "cache-control": "public, max-age=86400",
      "content-type": "text/css; charset=utf-8",
    },
  });
}
