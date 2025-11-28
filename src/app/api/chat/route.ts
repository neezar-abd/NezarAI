import { google } from "@ai-sdk/google";
import { streamText } from "ai";
import { getPersonaById } from "@/lib/personas";

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages, personaId, pinnedContext } = await req.json();

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

    const result = await streamText({
      model: google("gemini-2.5-flash"),
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
