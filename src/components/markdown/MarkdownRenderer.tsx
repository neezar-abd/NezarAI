"use client";

import { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Play } from "lucide-react";
import { CopyButton } from "@/components/chat/CopyButton";
import { CodePlayground } from "@/components/chat/CodePlayground";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const [playgroundCode, setPlaygroundCode] = useState<{ code: string; language: string } | null>(null);

  const openPlayground = (code: string, language: string) => {
    setPlaygroundCode({ code, language });
  };

  return (
    <div className="markdown-content">
      {/* Code Playground Modal */}
      {playgroundCode && (
        <CodePlayground
          code={playgroundCode.code}
          language={playgroundCode.language}
          isOpen={true}
          onClose={() => setPlaygroundCode(null)}
        />
      )}

      <Markdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");
            const language = match ? match[1] : "text";

            // Check if it's a code block (has language) or inline code
            const isCodeBlock = match || (codeString.includes("\n"));

            // Check if language supports playground
            const supportsPlayground = ["javascript", "js", "html", "css", "typescript", "ts"].includes(
              language.toLowerCase()
            );

            if (isCodeBlock) {
              return (
                <div className="relative group my-4">
                  <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex items-center gap-1">
                    {supportsPlayground && (
                      <button
                        onClick={() => openPlayground(codeString, language)}
                        className="p-2 rounded-lg bg-green-500/20 hover:bg-green-500/30 transition-colors"
                        title="Run in Playground"
                      >
                        <Play className="w-4 h-4 text-green-400" />
                      </button>
                    )}
                    <CopyButton text={codeString} />
                  </div>
                  <SyntaxHighlighter
                    style={oneDark}
                    language={language}
                    PreTag="div"
                    customStyle={{
                      margin: 0,
                      borderRadius: "0.5rem",
                      background: "#282c34",
                      padding: "1rem",
                      fontSize: "0.875rem",
                    }}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                  {supportsPlayground && (
                    <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-xs text-green-400/70 bg-black/50 px-2 py-1 rounded">
                        Click Play to run
                      </span>
                    </div>
                  )}
                </div>
              );
            }

            // Inline code
            return (
              <code
                className="bg-[var(--surface)] px-1.5 py-0.5 rounded text-sm"
                {...props}
              >
                {children}
              </code>
            );
          },
          // Style other elements
          p: ({ children }) => <p className="mb-4 last:mb-0 leading-7">{children}</p>,
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-4 space-y-1">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-4 space-y-1">{children}</ol>
          ),
          li: ({ children }) => <li className="leading-7">{children}</li>,
          h1: ({ children }) => (
            <h1 className="text-2xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl font-bold mb-3 mt-5 first:mt-0">{children}</h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg font-bold mb-2 mt-4 first:mt-0">{children}</h3>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-[var(--accent)] hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-[var(--accent)] pl-4 my-4 text-[var(--text-secondary)] italic">
              {children}
            </blockquote>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className="min-w-full border-collapse border border-[var(--border)]">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[var(--surface)]">{children}</thead>
          ),
          th: ({ children }) => (
            <th className="border border-[var(--border)] px-4 py-2 text-left font-semibold">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-[var(--border)] px-4 py-2">{children}</td>
          ),
          hr: () => <hr className="my-6 border-[var(--border)]" />,
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
        }}
      >
        {content}
      </Markdown>
    </div>
  );
}
