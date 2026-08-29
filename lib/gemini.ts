export interface GeminiImagePart {
  mimeType: string;
  base64: string;
}

// using gemini 3.6 flash
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
    const match = cleaned.match(/(\[[\s\S]*\]|\{[\s\S]*\})/);
    if (match) {
      return JSON.parse(match[0]) as T;
    }
    throw e;
  }
}
