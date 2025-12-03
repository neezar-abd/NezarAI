import { google } from "@ai-sdk/google";
import { streamText } from "ai";

export const maxDuration = 60;

// GitHub API base URL
const GITHUB_API = "https://api.github.com";

// Parse GitHub URL to extract owner, repo, and optional path
function parseGitHubUrl(url: string): { owner: string; repo: string; path?: string; type?: string } | null {
  // Handle various GitHub URL formats
  const patterns = [
    // https://github.com/owner/repo
    /github\.com\/([^\/]+)\/([^\/\s#?]+)/,
    // owner/repo format
    /^([^\/\s]+)\/([^\/\s#?]+)$/,
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) {
      const [, owner, repoWithPath] = match;
      const repo = repoWithPath.replace(/\.git$/, "");
      
      // Check for specific paths (blob, tree, etc.)
      const pathMatch = url.match(/github\.com\/[^\/]+\/[^\/]+\/(blob|tree)\/[^\/]+\/(.+)/);
      
      return {
        owner,
        repo,
        path: pathMatch ? pathMatch[2] : undefined,
        type: pathMatch ? pathMatch[1] : undefined,
      };
    }
  }
  return null;
}

// Fetch repository info
async function getRepoInfo(owner: string, repo: string) {
  try {
    const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "NezarAI-Bot",
      },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// Fetch README content
async function getReadme(owner: string, repo: string): Promise<string | null> {
  try {
    const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/readme`, {
      headers: {
        Accept: "application/vnd.github.v3.raw",
        "User-Agent": "NezarAI-Bot",
      },
    });
    if (!response.ok) return null;
    const text = await response.text();
    // Limit README size
    return text.slice(0, 8000);
  } catch {
    return null;
  }
}

// Fetch repository languages
async function getLanguages(owner: string, repo: string) {
  try {
    const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/languages`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "NezarAI-Bot",
      },
    });
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// Fetch file content
async function getFileContent(owner: string, repo: string, path: string): Promise<string | null> {
  try {
    const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Accept: "application/vnd.github.v3.raw",
        "User-Agent": "NezarAI-Bot",
      },
    });
    if (!response.ok) return null;
    const text = await response.text();
    return text.slice(0, 10000); // Limit file size
  } catch {
    return null;
  }
}

// Fetch directory structure
async function getDirectoryStructure(owner: string, repo: string, path: string = ""): Promise<any[]> {
  try {
    const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "NezarAI-Bot",
      },
    });
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

// Fetch recent commits
async function getRecentCommits(owner: string, repo: string, limit: number = 5) {
  try {
    const response = await fetch(`${GITHUB_API}/repos/${owner}/${repo}/commits?per_page=${limit}`, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "NezarAI-Bot",
      },
    });
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  try {
    const { url, action = "analyze", question } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL GitHub diperlukan" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const parsed = parseGitHubUrl(url);
    if (!parsed) {
      return new Response(
        JSON.stringify({ error: "URL GitHub tidak valid. Format: github.com/owner/repo atau owner/repo" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const { owner, repo, path } = parsed;

    // Fetch repository data in parallel
    const [repoInfo, readme, languages, structure, commits] = await Promise.all([
      getRepoInfo(owner, repo),
      getReadme(owner, repo),
      getLanguages(owner, repo),
      getDirectoryStructure(owner, repo),
      getRecentCommits(owner, repo),
    ]);

    if (!repoInfo) {
      return new Response(
        JSON.stringify({ error: "Repository tidak ditemukan atau tidak dapat diakses" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    // Build comprehensive context
    const languageList = languages ? Object.keys(languages).join(", ") : "Unknown";
    const topLevelFiles = structure
      .slice(0, 20)
      .map((item: any) => `${item.type === "dir" ? "📁" : "📄"} ${item.name}`)
      .join("\n");

    const recentCommitsList = commits
      .slice(0, 5)
      .map((c: any) => `- ${c.commit.message.split("\n")[0]} (${new Date(c.commit.author.date).toLocaleDateString()})`)
      .join("\n");

    const repoContext = `
📦 REPOSITORY GITHUB:
- Nama: ${repoInfo.full_name}
- Deskripsi: ${repoInfo.description || "Tidak ada deskripsi"}
- ⭐ Stars: ${repoInfo.stargazers_count}
- 🍴 Forks: ${repoInfo.forks_count}
- 👀 Watchers: ${repoInfo.watchers_count}
- 🐛 Issues: ${repoInfo.open_issues_count}
- 📅 Dibuat: ${new Date(repoInfo.created_at).toLocaleDateString()}
- 🔄 Update: ${new Date(repoInfo.updated_at).toLocaleDateString()}
- 🔗 URL: ${repoInfo.html_url}
- 📜 License: ${repoInfo.license?.name || "Tidak ada"}

💻 BAHASA PEMROGRAMAN:
${languageList}

📂 STRUKTUR FILE (root):
${topLevelFiles}

📝 COMMIT TERBARU:
${recentCommitsList}

${readme ? `📖 README:\n${readme}` : "README tidak tersedia"}
`;

    // Different prompts based on action
    const prompts: Record<string, string> = {
      analyze: `Analisis repository GitHub berikut:

${repoContext}

Format jawaban HARUS seperti ini:

## 🎯 Tujuan Project
[Jelaskan fungsi utama repo ini dalam 2-3 kalimat]

## 🏗️ Tech Stack
| Kategori | Teknologi |
|----------|-----------|
| Bahasa | [bahasa yang digunakan] |
| Framework | [framework jika ada] |
| Database | [database jika ada] |

## ✨ Fitur Utama
- **[Fitur 1]**: [penjelasan singkat]
- **[Fitur 2]**: [penjelasan singkat]
- **[Fitur 3]**: [penjelasan singkat]

## 📊 Statistik
- ⭐ **Stars**: ${repoInfo.stargazers_count} - [interpretasi popularitas]
- 🍴 **Forks**: ${repoInfo.forks_count} - [interpretasi aktivitas]
- 🐛 **Issues**: ${repoInfo.open_issues_count} - [interpretasi maintenance]

## 🚀 Quick Start
\`\`\`bash
# Clone repository
git clone ${repoInfo.html_url}

# Langkah selanjutnya (sesuaikan dengan repo)
\`\`\`

## 💡 Cocok Untuk
[Jelaskan untuk siapa repo ini cocok digunakan]

Gunakan bahasa Indonesia.`,

      review: `Review kode dari repository GitHub berikut:

${repoContext}

Format jawaban HARUS seperti ini:

## 📋 Code Review Summary

### ✅ Kelebihan
1. **[Aspek positif 1]**: [penjelasan]
2. **[Aspek positif 2]**: [penjelasan]
3. **[Aspek positif 3]**: [penjelasan]

### ⚠️ Area Perbaikan
1. **[Issue 1]**: [penjelasan dan saran]
2. **[Issue 2]**: [penjelasan dan saran]
3. **[Issue 3]**: [penjelasan dan saran]

### 🔒 Keamanan
- [Checklist keamanan yang relevan]

### 📈 Skalabilitas
[Analisis singkat tentang skalabilitas kode]

### 🔧 Rekomendasi
1. [Saran improvement 1]
2. [Saran improvement 2]
3. [Saran improvement 3]

### 📊 Rating
| Aspek | Score |
|-------|-------|
| Code Quality | ⭐⭐⭐⭐☆ |
| Documentation | ⭐⭐⭐☆☆ |
| Best Practices | ⭐⭐⭐⭐☆ |

Gunakan bahasa Indonesia.`,

      explain: `Jelaskan repository GitHub berikut untuk pemula:

${repoContext}

Format jawaban HARUS seperti ini:

## 🤔 Apa itu ${repoInfo.name}?
[Penjelasan sederhana dalam bahasa sehari-hari, seperti menjelaskan ke teman]

## 🎯 Untuk Apa?
- [Use case 1]
- [Use case 2]
- [Use case 3]

## 🛠️ Teknologi yang Digunakan
[Jelaskan setiap teknologi dengan analogi sederhana]

## 📚 Cara Mulai Belajar
1. **Langkah 1**: [instruksi]
2. **Langkah 2**: [instruksi]
3. **Langkah 3**: [instruksi]

## 🌟 Tips untuk Pemula
> 💡 [Tip penting untuk pemula]

- [Tip 1]
- [Tip 2]
- [Tip 3]

Gunakan bahasa Indonesia yang friendly!`,

      question: `Berdasarkan repository GitHub berikut:

${repoContext}

**Pertanyaan User**: ${question || "Jelaskan repository ini"}

Format jawaban dengan jelas dan terstruktur menggunakan Markdown.
Gunakan heading, bullet points, dan code blocks jika diperlukan.
Jawab dalam bahasa Indonesia.`,
    };

    const systemPrompt = `Kamu adalah AI assistant yang ahli dalam menganalisis repository GitHub.
Kamu memahami berbagai bahasa pemrograman, framework, dan best practices development.
Berikan analisis yang insightful, praktis, dan mudah dipahami.
Jika ada informasi yang kurang, berikan analisis terbaik berdasarkan data yang tersedia.`;

    // Use Pro for accurate GitHub code analysis
    const result = await streamText({
      model: google("gemini-2.5-pro"),
      system: systemPrompt,
      messages: [{ role: "user", content: prompts[action] || prompts.analyze }],
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("GitHub API Error:", error);
    return new Response(
      JSON.stringify({ error: "Terjadi kesalahan saat memproses repository" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

// GET endpoint to fetch repo info only
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");

  if (!url) {
    return new Response(
      JSON.stringify({ error: "URL parameter required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const parsed = parseGitHubUrl(url);
  if (!parsed) {
    return new Response(
      JSON.stringify({ error: "Invalid GitHub URL" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { owner, repo } = parsed;
  const [repoInfo, languages] = await Promise.all([
    getRepoInfo(owner, repo),
    getLanguages(owner, repo),
  ]);

  if (!repoInfo) {
    return new Response(
      JSON.stringify({ error: "Repository not found" }),
      { status: 404, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({
      name: repoInfo.name,
      fullName: repoInfo.full_name,
      description: repoInfo.description,
      stars: repoInfo.stargazers_count,
      forks: repoInfo.forks_count,
      issues: repoInfo.open_issues_count,
      languages: languages ? Object.keys(languages) : [],
      url: repoInfo.html_url,
      owner: {
        login: repoInfo.owner.login,
        avatar: repoInfo.owner.avatar_url,
      },
    }),
    { headers: { "Content-Type": "application/json" } }
  );
}
