/**
 * File processing utilities for extracting text from documents
 */

export interface ProcessedFile {
  name: string;
  type: string;
  size: number;
  content: string;
  error?: string;
}

/**
 * Supported file types and their MIME types
 */
export const SUPPORTED_FILE_TYPES = {
  // Text files
  'text/plain': { extension: '.txt', name: 'Text' },
  'text/markdown': { extension: '.md', name: 'Markdown' },
  'text/csv': { extension: '.csv', name: 'CSV' },
  
  // Code files
  'text/javascript': { extension: '.js', name: 'JavaScript' },
  'application/javascript': { extension: '.js', name: 'JavaScript' },
  'text/typescript': { extension: '.ts', name: 'TypeScript' },
  'application/typescript': { extension: '.ts', name: 'TypeScript' },
  'text/html': { extension: '.html', name: 'HTML' },
  'text/css': { extension: '.css', name: 'CSS' },
  'application/json': { extension: '.json', name: 'JSON' },
  'application/xml': { extension: '.xml', name: 'XML' },
  'text/xml': { extension: '.xml', name: 'XML' },
  
  // Documents (text-based extraction only)
  'application/pdf': { extension: '.pdf', name: 'PDF' },
};

export const SUPPORTED_EXTENSIONS = [
  '.txt', '.md', '.csv', '.json', '.xml',
  '.js', '.jsx', '.ts', '.tsx', '.html', '.css',
  '.py', '.java', '.cpp', '.c', '.h', '.hpp',
  '.rb', '.go', '.rs', '.php', '.sql',
  '.yaml', '.yml', '.toml', '.ini', '.env',
  '.sh', '.bat', '.ps1',
  '.pdf',
];

/**
 * Maximum file size in bytes (5MB)
 */
export const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Check if a file type is supported
 */
export function isFileSupported(file: File): boolean {
  // Check by MIME type
  if (SUPPORTED_FILE_TYPES[file.type as keyof typeof SUPPORTED_FILE_TYPES]) {
    return true;
  }
  
  // Check by extension
  const extension = '.' + file.name.split('.').pop()?.toLowerCase();
  return SUPPORTED_EXTENSIONS.includes(extension);
}

/**
 * Read file as text
 */
export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsText(file);
  });
}

/**
 * Read file as ArrayBuffer (for PDF)
 */
export function readFileAsArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new Error('Gagal membaca file'));
    reader.readAsArrayBuffer(file);
  });
}

/**
 * Extract text from PDF using pdf.js
 * Note: This is a simplified version - for production, use pdf.js library
 */
async function extractTextFromPDF(file: File): Promise<string> {
  // For now, we'll indicate PDF content without full extraction
  // Full PDF extraction would require pdf.js library
  return `[Dokumen PDF: ${file.name}]\n\n` +
    `Ukuran: ${(file.size / 1024).toFixed(2)} KB\n\n` +
    `Catatan: Untuk analisis PDF yang lebih mendalam, konten teks tidak dapat diekstrak secara penuh di browser. ` +
    `Silakan copy-paste teks penting dari PDF jika diperlukan.`;
}

/**
 * Process a file and extract its content
 */
export async function processFile(file: File): Promise<ProcessedFile> {
  const result: ProcessedFile = {
    name: file.name,
    type: file.type,
    size: file.size,
    content: '',
  };

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    result.error = `File terlalu besar. Maksimal ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
    return result;
  }

  // Check if supported
  if (!isFileSupported(file)) {
    result.error = 'Tipe file tidak didukung';
    return result;
  }

  try {
    // Handle PDF files
    if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
      result.content = await extractTextFromPDF(file);
      return result;
    }

    // Handle text-based files
    result.content = await readFileAsText(file);
    
    // Add file header for context
    const extension = file.name.split('.').pop()?.toLowerCase() || '';
    result.content = `[File: ${file.name}]\n\`\`\`${extension}\n${result.content}\n\`\`\``;
    
    return result;
  } catch (error) {
    result.error = error instanceof Error ? error.message : 'Gagal memproses file';
    return result;
  }
}

/**
 * Process multiple files
 */
export async function processFiles(files: FileList | File[]): Promise<ProcessedFile[]> {
  const fileArray = Array.from(files);
  const results = await Promise.all(fileArray.map(processFile));
  return results;
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}

/**
 * Get file icon based on type/extension
 */
export function getFileIcon(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase() || '';
  
  const icons: Record<string, string> = {
    pdf: '📄',
    txt: '📝',
    md: '📝',
    json: '📋',
    csv: '📊',
    xml: '📋',
    html: '🌐',
    css: '🎨',
    js: '⚡',
    jsx: '⚛️',
    ts: '💎',
    tsx: '⚛️',
    py: '🐍',
    java: '☕',
    cpp: '⚙️',
    c: '⚙️',
    go: '🐹',
    rs: '🦀',
    rb: '💎',
    php: '🐘',
    sql: '🗃️',
    yaml: '📋',
    yml: '📋',
    sh: '💻',
    bat: '💻',
  };
  
  return icons[ext] || '📁';
}
