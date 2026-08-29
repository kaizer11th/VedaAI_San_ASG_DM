// Thin wrapper around Google Gemini's generateContent REST endpoint.
// The API key lives only in the server's environment (GEMINI_API_KEY) — it is
// never sent to or stored by the browser.

export interface GeminiImagePart {
  mimeType: string;
  base64: string;
}

// gemini-2.0-flash was retired by Google; gemini-3.6-flash is the current stable
// Flash model (as of mid-2026) with the same free tier + vision/JSON support.
const MODEL = "gemini-3.6-flash";

function endpoint() {
  return `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;
}

export async function callGemini(
  prompt: string,
  images: GeminiImagePart[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "Server is missing GEMINI_API_KEY. Add it to .env.local (dev) or your host's environment variables (production)."
    );
  }

  const parts: any[] = [{ text: prompt }];
  for (const img of images) {
    parts.push({
      inline_data: {
        mime_type: img.mimeType,
        data: img.base64
      }
    });
  }

  const body = {
    contents: [{ role: "user", parts }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json"
    }
  };

  const res = await fetch(endpoint(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Gemini API error (${res.status}): ${errText}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }
  return text;
}

// Defensive JSON parsing: strips markdown code fences if the model adds them anyway.
export function parseJson<T>(raw: string): T {
  let cleaned = raw.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
  }
  try {
    return JSON.parse(cleaned) as T;
  } catch (e) {
    // Try to salvage the largest {...} or [...] block
    const match = cleaned.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (match) {
      return JSON.parse(match[0]) as T;
    }
    throw e;
  }
}
