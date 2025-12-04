import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { generateText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json();

    if (!prompt || typeof prompt !== "string") {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Use fast model for quick enhancement
    const google = createGoogleGenerativeAI({
      apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    });

    const result = await generateText({
      model: google("gemini-2.0-flash-lite"),
      system: `Kamu adalah ahli prompt engineering. Tugasmu adalah memperbaiki dan memperkaya prompt user agar lebih jelas, spesifik, dan efektif untuk mendapatkan respons AI yang lebih baik.

Aturan:
1. Pertahankan intent/maksud asli user
2. Tambahkan konteks yang relevan jika kurang
3. Buat lebih spesifik dan actionable
4. Gunakan bahasa yang sama dengan input (Indonesia/English)
5. Jangan terlalu panjang, maksimal 2-3 kalimat
6. Jangan tambahkan instruksi format output kecuali relevan
7. Jika prompt sudah bagus, kembalikan dengan perbaikan minor saja

PENTING: Kembalikan HANYA prompt yang sudah di-enhance, tanpa penjelasan atau komentar apapun.`,
      prompt: `Enhance prompt berikut:\n\n"${prompt}"`,
    });

    return new Response(
      JSON.stringify({ enhanced: result.text.trim() }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Enhance prompt error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to enhance prompt" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
