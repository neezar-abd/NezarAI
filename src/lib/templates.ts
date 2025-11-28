// Pre-defined prompt templates
export interface PromptTemplate {
  id: string;
  name: string;
  icon: string;
  description: string;
  prompt: string;
  category: "coding" | "writing" | "learning" | "productivity";
}

export const promptTemplates: PromptTemplate[] = [
  // Coding Templates
  {
    id: "code-review",
    name: "Review Kode",
    icon: "search",
    description: "Minta review untuk kode kamu",
    prompt: "Tolong review kode berikut dan berikan saran perbaikan:\n\n```\n[PASTE KODE DI SINI]\n```",
    category: "coding",
  },
  {
    id: "explain-code",
    name: "Jelaskan Kode",
    icon: "book-open",
    description: "Minta penjelasan tentang kode",
    prompt: "Jelaskan kode berikut baris per baris:\n\n```\n[PASTE KODE DI SINI]\n```",
    category: "coding",
  },
  {
    id: "fix-bug",
    name: "Perbaiki Bug",
    icon: "bug",
    description: "Minta bantuan debug error",
    prompt: "Saya mendapat error berikut:\n\n```\n[PASTE ERROR MESSAGE]\n```\n\nKode saya:\n\n```\n[PASTE KODE]\n```\n\nBagaimana cara memperbaikinya?",
    category: "coding",
  },
  {
    id: "write-test",
    name: "Buat Unit Test",
    icon: "check-circle",
    description: "Generate unit test untuk kode",
    prompt: "Buatkan unit test untuk fungsi/kode berikut:\n\n```\n[PASTE KODE]\n```\n\nGunakan framework testing: [Jest/Pytest/dll]",
    category: "coding",
  },
  {
    id: "optimize-code",
    name: "Optimasi Kode",
    icon: "zap",
    description: "Minta optimasi performa kode",
    prompt: "Tolong optimasi kode berikut untuk performa yang lebih baik:\n\n```\n[PASTE KODE]\n```\n\nJelaskan juga apa yang dioptimasi dan kenapa.",
    category: "coding",
  },
  {
    id: "convert-code",
    name: "Konversi Bahasa",
    icon: "refresh-cw",
    description: "Konversi kode ke bahasa lain",
    prompt: "Konversi kode berikut dari [BAHASA ASAL] ke [BAHASA TUJUAN]:\n\n```\n[PASTE KODE]\n```",
    category: "coding",
  },

  // Learning Templates
  {
    id: "explain-concept",
    name: "Jelaskan Konsep",
    icon: "lightbulb",
    description: "Minta penjelasan konsep programming",
    prompt: "Jelaskan konsep [NAMA KONSEP] dengan:\n1. Penjelasan sederhana\n2. Analogi sehari-hari\n3. Contoh kode\n4. Kapan harus menggunakannya",
    category: "learning",
  },
  {
    id: "compare-tech",
    name: "Bandingkan Teknologi",
    icon: "scale",
    description: "Bandingkan dua teknologi/framework",
    prompt: "Bandingkan [TEKNOLOGI A] vs [TEKNOLOGI B]:\n1. Kelebihan dan kekurangan masing-masing\n2. Kapan sebaiknya menggunakan yang mana\n3. Contoh use case\n4. Performance comparison",
    category: "learning",
  },
  {
    id: "roadmap",
    name: "Buat Roadmap Belajar",
    icon: "map",
    description: "Minta roadmap untuk belajar teknologi",
    prompt: "Buatkan roadmap belajar [TEKNOLOGI/SKILL] untuk pemula hingga mahir:\n1. Apa yang harus dipelajari\n2. Urutan belajarnya\n3. Resource yang direkomendasikan\n4. Estimasi waktu per tahap",
    category: "learning",
  },

  // Writing Templates
  {
    id: "write-docs",
    name: "Buat Dokumentasi",
    icon: "file-text",
    description: "Generate dokumentasi untuk kode",
    prompt: "Buatkan dokumentasi lengkap untuk kode berikut:\n\n```\n[PASTE KODE]\n```\n\nSertakan:\n- Deskripsi fungsi\n- Parameter dan return value\n- Contoh penggunaan\n- Edge cases",
    category: "writing",
  },
  {
    id: "write-readme",
    name: "Buat README",
    icon: "clipboard",
    description: "Generate README.md untuk project",
    prompt: "Buatkan README.md untuk project dengan detail:\n\nNama Project: [NAMA]\nDeskripsi: [DESKRIPSI SINGKAT]\nTech Stack: [TECHNOLOGIES]\n\nSertakan section: Installation, Usage, API Reference, Contributing, License",
    category: "writing",
  },
  {
    id: "write-commit",
    name: "Buat Commit Message",
    icon: "git-commit",
    description: "Generate commit message yang baik",
    prompt: "Buatkan commit message yang baik untuk perubahan berikut:\n\n[JELASKAN PERUBAHAN YANG DILAKUKAN]\n\nGunakan format conventional commits (feat/fix/docs/style/refactor/test/chore)",
    category: "writing",
  },

  // Productivity Templates
  {
    id: "plan-feature",
    name: "Rencana Fitur",
    icon: "target",
    description: "Breakdown fitur jadi tasks",
    prompt: "Bantu saya breakdown fitur ini menjadi tasks yang actionable:\n\nFitur: [NAMA FITUR]\nDeskripsi: [DESKRIPSI FITUR]\n\nBerikan:\n1. Task breakdown\n2. Estimasi waktu\n3. Dependencies\n4. Potential challenges",
    category: "productivity",
  },
  {
    id: "api-design",
    name: "Design API",
    icon: "plug",
    description: "Bantu design REST API",
    prompt: "Bantu saya design REST API untuk:\n\nResource: [NAMA RESOURCE]\nOperations needed: [LIST OPERASI]\n\nBerikan:\n1. Endpoint paths\n2. HTTP methods\n3. Request/Response schema\n4. Status codes\n5. Error handling",
    category: "productivity",
  },
  {
    id: "db-schema",
    name: "Design Database",
    icon: "database",
    description: "Bantu design database schema",
    prompt: "Bantu saya design database schema untuk:\n\nAplikasi: [DESKRIPSI APLIKASI]\nEntities: [LIST ENTITY]\n\nBerikan:\n1. Table definitions\n2. Relationships\n3. Indexes yang direkomendasikan\n4. SQL creation script",
    category: "productivity",
  },
];

export const templateCategories = [
  { id: "coding", name: "Coding", icon: "code" },
  { id: "learning", name: "Learning", icon: "book-open" },
  { id: "writing", name: "Writing", icon: "pen-tool" },
  { id: "productivity", name: "Productivity", icon: "rocket" },
] as const;

export function getTemplatesByCategory(category: string): PromptTemplate[] {
  return promptTemplates.filter((t) => t.category === category);
}
