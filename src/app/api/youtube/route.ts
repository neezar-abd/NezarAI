import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const maxDuration = 60;

// Extract YouTube video ID from various URL formats
function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/, // Direct video ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

// Fetch video metadata using YouTube oEmbed API (no API key needed)
async function getVideoMetadata(videoId: string) {
  try {
    const oEmbedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const response = await fetch(oEmbedUrl);
    if (!response.ok) throw new Error("Video not found");
    return await response.json();
  } catch {
    return null;
  }
}

// Fetch transcript using a free transcript service
async function getTranscript(videoId: string): Promise<string | null> {
  try {
    // Try using youtubetranscript.com API (free, no key needed)
    const response = await fetch(
      `https://yt.lemnoslife.com/noKey/videos?part=snippet&id=${videoId}`
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.items && data.items[0]) {
        return data.items[0].snippet?.description || null;
      }
    }

    // Alternative: Try getting captions via another method
    // For now, we'll work with video metadata + AI analysis
    return null;
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  try {
    const { url, action = "summarize", language = "id" } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL YouTube diperlukan" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return new Response(
        JSON.stringify({ error: "URL YouTube tidak valid" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Get video metadata
    const metadata = await getVideoMetadata(videoId);
    if (!metadata) {
      return new Response(
        JSON.stringify({ error: "Video tidak ditemukan atau tidak tersedia" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build context for Gemini
    const videoContext = `
VIDEO YOUTUBE:
- Judul: ${metadata.title}
- Channel: ${metadata.author_name}
- URL: https://www.youtube.com/watch?v=${videoId}
- Thumbnail: ${metadata.thumbnail_url}
`;

    // Different prompts based on action
    const prompts: Record<string, string> = {
      summarize: `Analisis video YouTube berikut dan berikan ringkasan yang terstruktur:

${videoContext}

Format jawaban HARUS seperti ini:

## 📋 Ringkasan
[Berikan ringkasan singkat 2-3 kalimat tentang apa yang dibahas dalam video]

## 🎯 Poin Utama
- **Poin 1**: [Penjelasan singkat]
- **Poin 2**: [Penjelasan singkat]
- **Poin 3**: [Penjelasan singkat]
- **Poin 4**: [Penjelasan singkat jika ada]
- **Poin 5**: [Penjelasan singkat jika ada]

## 👤 Tentang Channel
[Info tentang creator/channel jika kamu tahu, atau skip jika tidak yakin]

## 💡 Insight Tambahan
[Konteks atau informasi relevan lainnya yang berguna]

Gunakan bahasa ${language === "id" ? "Indonesia" : "Inggris"} yang mudah dipahami. Jangan menambah section lain selain yang diminta.`,

      keypoints: `Dari video YouTube berikut, ekstrak poin-poin kunci:

${videoContext}

Format jawaban HARUS seperti ini:

## 📌 Poin-Poin Kunci

### 1. [Judul Poin]
[Penjelasan singkat 1-2 kalimat]

### 2. [Judul Poin]
[Penjelasan singkat 1-2 kalimat]

### 3. [Judul Poin]
[Penjelasan singkat 1-2 kalimat]

[Lanjutkan sampai 5-7 poin]

## 🎬 Kesimpulan
[Satu paragraf kesimpulan utama dari video]

Gunakan bahasa ${language === "id" ? "Indonesia" : "Inggris"}. Buat poin-poin yang actionable dan mudah diingat.`,

      explain: `Jelaskan topik dari video YouTube berikut secara mendalam:

${videoContext}

Format jawaban HARUS seperti ini:

## 📚 Penjelasan Topik

### Apa itu?
[Definisi atau penjelasan dasar topik]

### Mengapa Penting?
[Jelaskan relevansi dan pentingnya topik ini]

### Poin-Poin Penting
1. **[Poin]**: [Penjelasan]
2. **[Poin]**: [Penjelasan]
3. **[Poin]**: [Penjelasan]

### Contoh atau Aplikasi
[Berikan contoh konkret jika relevan]

### Tips atau Saran
[Berikan tips praktis terkait topik]

Gunakan bahasa ${language === "id" ? "Indonesia" : "Inggris"}. Jelaskan seolah-olah kamu expert di bidang ini.`,
    };

    const systemPrompt = `Kamu adalah AI assistant yang ahli dalam menganalisis dan meringkas konten video YouTube. 
Kamu memiliki pengetahuan luas tentang berbagai topik dan creator YouTube.
Berikan analisis yang insightful dan informatif berdasarkan judul, channel, dan konteks video.
Jika kamu tidak yakin tentang sesuatu, katakan dengan jujur tapi tetap berikan analisis terbaik.`;

    // Use Flash for quick YouTube summaries (balance speed & quality)
    const result = await streamText({
      model: google("gemini-2.5-flash"),
      system: systemPrompt,
      messages: [{ role: "user", content: prompts[action] || prompts.summarize }],
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("YouTube API Error:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan saat memproses video" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// GET endpoint to fetch video metadata only
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return new Response(
      JSON.stringify({ error: "URL parameter required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const videoId = extractVideoId(url);
  if (!videoId) {
    return new Response(
      JSON.stringify({ error: "Invalid YouTube URL" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const metadata = await getVideoMetadata(videoId);
  if (!metadata) {
    return new Response(
      JSON.stringify({ error: "Video not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({
      videoId,
      title: metadata.title,
      author: metadata.author_name,
      authorUrl: metadata.author_url,
      thumbnail: metadata.thumbnail_url,
      embedUrl: `https://www.youtube.com/embed/${videoId}`,
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}
