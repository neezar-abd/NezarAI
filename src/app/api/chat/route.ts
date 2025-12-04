import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { streamText } from "ai";
import { getPersonaById } from "@/lib/personas";

// Allow streaming responses up to 60 seconds for web search
export const maxDuration = 60;

// Default model
const DEFAULT_MODEL = "gemini-2.0-flash-lite";

// Allowed models for security
const ALLOWED_MODELS = [
  "gemini-2.0-flash-lite",  // Cepat
  "gemini-2.5-flash",       // Seimbang
  "gemini-2.5-pro",         // Akurat
];

export async function POST(req: Request) {
  try {
    const { messages, personaId, pinnedContext, modelId, useWebSearch } = await req.json();

    // Validate and get model
    let model = ALLOWED_MODELS.includes(modelId) ? modelId : DEFAULT_MODEL;

    // If web search is enabled, use gemini-2.0-flash (best support for grounding)
    if (useWebSearch) {
      model = "gemini-2.0-flash";
    }

    // Get persona system prompt
    const persona = getPersonaById(personaId || "assistant");

    // Enhanced system prompt with follow-up suggestions instruction and pinned context
    const enhancedSystemPrompt = `${persona.systemPrompt}${pinnedContext || ""}

PENTING: Di akhir setiap respons, SELALU tambahkan section follow-up suggestions dalam format berikut:
---SUGGESTIONS---
["Pertanyaan lanjutan 1?", "Pertanyaan lanjutan 2?", "Pertanyaan lanjutan 3?"]
---END_SUGGESTIONS---

Berikan 3 pertanyaan lanjutan yang relevan dan membantu user explore topik lebih dalam.
Pertanyaan harus spesifik, actionable, dan sesuai dengan konteks percakapan.`;

    // Convert messages to the format expected by the AI SDK
    const formattedMessages = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    // Create Google AI provider with optional grounding
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    // Create model with Google Search grounding if enabled
    const googleModel = google(model, {
      useSearchGrounding: useWebSearch,
    });

    const result = await streamText({
      model: googleModel,
      system: enhancedSystemPrompt,
      messages: formattedMessages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan saat memproses permintaan" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
