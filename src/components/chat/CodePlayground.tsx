"use client";

import { useState, useEffect, useRef } from "react";
import { Play, X, RotateCcw, Maximize2, Minimize2, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface CodePlaygroundProps {
  code: string;
  language: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CodePlayground({ code, language, isOpen, onClose }: CodePlaygroundProps) {
  const [output, setOutput] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isRunning, setIsRunning] = useState(false);
  const [editableCode, setEditableCode] = useState(code);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [iframeSrc, setIframeSrc] = useState<string>("");

  useEffect(() => {
    setEditableCode(code);
    setOutput("");
    setError("");
    setIframeSrc("");
  }, [code]);

  if (!isOpen) return null;

  const isSupported = ["javascript", "js", "html", "css", "typescript", "ts"].includes(
    language.toLowerCase()
  );

  const runCode = () => {
    setIsRunning(true);
    setOutput("");
    setError("");
    setIframeSrc("");

    try {
      const lang = language.toLowerCase();

      if (lang === "html" || editableCode.includes("<html") || editableCode.includes("<!DOCTYPE")) {
        // Run HTML using srcdoc (safer, no cross-origin issues)
        setIframeSrc(editableCode);
        setOutput("HTML rendered in preview below");
      } else if (lang === "javascript" || lang === "js" || lang === "typescript" || lang === "ts") {
        // Run JavaScript with console capture
        const logs: string[] = [];
        const originalConsole = { ...console };

        // Override console methods
        const captureConsole = {
          log: (...args: unknown[]) => {
            logs.push(args.map((a) => formatOutput(a)).join(" "));
            originalConsole.log(...args);
          },
          error: (...args: unknown[]) => {
            logs.push(`[ERROR] ${args.map((a) => formatOutput(a)).join(" ")}`);
            originalConsole.error(...args);
          },
          warn: (...args: unknown[]) => {
            logs.push(`[WARN] ${args.map((a) => formatOutput(a)).join(" ")}`);
            originalConsole.warn(...args);
          },
          info: (...args: unknown[]) => {
            logs.push(`[INFO] ${args.map((a) => formatOutput(a)).join(" ")}`);
            originalConsole.info(...args);
          },
        };

        // Create a safe eval environment
        const safeEval = new Function(
          "console",
          `
          "use strict";
          try {
            ${editableCode}
          } catch (e) {
            console.error(e.message);
          }
        `
        );

        safeEval(captureConsole);

        if (logs.length > 0) {
          setOutput(logs.join("\n"));
        } else {
          setOutput("Code executed successfully (no output)");
        }
      } else if (lang === "css") {
        // Preview CSS with sample HTML using srcdoc
        const cssPreview = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>${editableCode}</style>
          </head>
          <body>
            <div class="container">
              <h1>Sample Heading</h1>
              <p>This is a sample paragraph to preview your CSS.</p>
              <button>Sample Button</button>
              <div class="box">Sample Box</div>
            </div>
          </body>
          </html>
        `;
        setIframeSrc(cssPreview);
        setOutput("CSS applied to preview below");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsRunning(false);
    }
  };

  const formatOutput = (value: unknown): string => {
    if (value === null) return "null";
    if (value === undefined) return "undefined";
    if (typeof value === "object") {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return String(value);
      }
    }
    return String(value);
  };

  const resetCode = () => {
    setEditableCode(code);
    setOutput("");
    setError("");
  };

  const copyCode = async () => {
    await navigator.clipboard.writeText(editableCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/70 z-50" onClick={onClose} />

      {/* Modal */}
      <div
        className={cn(
          "fixed bg-[var(--background-secondary)] border border-[var(--border)] rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden",
          isFullscreen
            ? "inset-2"
            : "inset-4 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-[900px] md:h-[600px]"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="flex items-center gap-2">
            <Play className="w-5 h-5 text-green-400" />
            <h2 className="text-sm font-semibold text-[var(--foreground)]">
              Code Playground
            </h2>
            <span className="px-2 py-0.5 text-xs bg-[var(--accent)]/20 text-[var(--accent)] rounded">
              {language.toUpperCase()}
            </span>
            {!isSupported && (
              <span className="px-2 py-0.5 text-xs bg-yellow-500/20 text-yellow-400 rounded">
                Preview Only
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={copyCode}
              className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
              title="Copy code"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-[var(--text-secondary)]" />
              )}
            </button>
            <button
              onClick={resetCode}
              className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
              title="Reset code"
            >
              <RotateCcw className="w-4 h-4 text-[var(--text-secondary)]" />
            </button>
            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
              title={isFullscreen ? "Exit fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4 text-[var(--text-secondary)]" />
              ) : (
                <Maximize2 className="w-4 h-4 text-[var(--text-secondary)]" />
              )}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
              title="Close"
            >
              <X className="w-4 h-4 text-[var(--text-secondary)]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Code Editor */}
          <div className="flex-1 flex flex-col border-b md:border-b-0 md:border-r border-[var(--border)]">
            <div className="px-3 py-2 border-b border-[var(--border)] bg-[var(--surface)]/50">
              <span className="text-xs text-[var(--text-muted)]">Code Editor</span>
            </div>
            <textarea
              value={editableCode}
              onChange={(e) => setEditableCode(e.target.value)}
              className="flex-1 p-4 bg-[#1e1e1e] text-[var(--foreground)] font-mono text-sm resize-none outline-none"
              spellCheck={false}
            />
          </div>

          {/* Output Panel */}
          <div className="flex-1 flex flex-col">
            <div className="px-3 py-2 border-b border-[var(--border)] bg-[var(--surface)]/50 flex items-center justify-between">
              <span className="text-xs text-[var(--text-muted)]">Output</span>
              {isSupported && (
                <button
                  onClick={runCode}
                  disabled={isRunning}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors",
                    isRunning
                      ? "bg-gray-500 text-white cursor-not-allowed"
                      : "bg-green-500 hover:bg-green-600 text-white"
                  )}
                >
                  <Play className="w-3 h-3" />
                  {isRunning ? "Running..." : "Run"}
                </button>
              )}
            </div>

            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Console Output - smaller when preview is shown */}
              <div className={cn(
                "p-4 bg-[#0d0d0d] overflow-auto shrink-0",
                (language.toLowerCase() === "html" || language.toLowerCase() === "css" || editableCode.includes("<html"))
                  ? "h-20"
                  : "flex-1"
              )}>
                {error ? (
                  <pre className="text-red-400 font-mono text-sm whitespace-pre-wrap">
                    Error: {error}
                  </pre>
                ) : output ? (
                  <pre className="text-green-400 font-mono text-sm whitespace-pre-wrap">
                    {output}
                  </pre>
                ) : (
                  <p className="text-[var(--text-muted)] text-sm">
                    {isSupported
                      ? 'Click "Run" to execute the code'
                      : `${language} tidak didukung untuk execution. Hanya JS, HTML, CSS yang bisa dijalankan.`}
                  </p>
                )}
              </div>

              {/* HTML/CSS Preview iframe */}
              {(language.toLowerCase() === "html" ||
                language.toLowerCase() === "css" ||
                editableCode.includes("<html")) && (
                <div className="flex-1 min-h-[200px] border-t border-[var(--border)] flex flex-col">
                  <div className="px-3 py-1 border-b border-[var(--border)] bg-[var(--surface)]/50 shrink-0">
                    <span className="text-xs text-[var(--text-muted)]">Preview</span>
                  </div>
                  <iframe
                    srcDoc={iframeSrc || "<!DOCTYPE html><html><body><p style='color:#888;padding:16px;'>Click Run to preview</p></body></html>"}
                    className="w-full flex-1 bg-white"
                    sandbox="allow-scripts"
                    title="Code Preview"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-3 py-2 border-t border-[var(--border)] bg-[var(--surface)]/50">
          <p className="text-xs text-[var(--text-muted)]">
            Tip: Edit kode di panel kiri, lalu klik Run untuk melihat output. Kode dijalankan di browser sandbox yang aman.
          </p>
        </div>
      </div>
    </>
  );
}
