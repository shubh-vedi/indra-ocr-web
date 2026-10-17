"use client";

import { useState, useCallback } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { OCRResponse, OutputFormat } from "./OCRApp";

interface OCRResultProps {
  result: OCRResponse | null;
  isProcessing: boolean;
  format: OutputFormat;
}

function formatMs(ms: number) {
  return ms < 1000 ? `${ms} ms` : `${(ms / 1000).toFixed(2)} s`;
}

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(2)} MB`;
}

// ---------- Empty state ----------
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center px-8 select-none">
      <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center mb-5">
        <svg className="w-8 h-8 text-zinc-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
      </div>
      <p className="text-sm font-medium text-zinc-400">No results yet</p>
      <p className="text-xs text-zinc-300 mt-1 max-w-[200px] leading-relaxed">
        Upload a file and run OCR to see the extracted text here
      </p>
    </div>
  );
}

// ---------- Processing state ----------
function ProcessingState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] gap-5 select-none">
      {/* Spinner */}
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-2 border-zinc-100" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-zinc-800 animate-spin" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-zinc-600">Running OCR</p>
        <p className="text-xs text-zinc-400 mt-1">
          First run downloads the model (~18 MB)
        </p>
      </div>
      {/* Skeleton lines */}
      <div className="w-full max-w-md space-y-2.5 px-8 mt-2">
        {[85, 70, 90, 55, 75, 40, 80].map((w, i) => (
          <div key={i} className="skeleton h-3 rounded" style={{ width: `${w}%` }} />
        ))}
      </div>
    </div>
  );
}

// ---------- Main component ----------
export function OCRResult({ result, isProcessing, format }: OCRResultProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [viewMode, setViewMode] = useState<"rendered" | "raw">("rendered");
  const [copied, setCopied] = useState(false);

  const currentContent = result
    ? result.pages.length === 1
      ? result.pages[0].content
      : activeTab === -1
        ? result.output
        : (result.pages[activeTab]?.content ?? result.output)
    : "";

  const handleCopy = useCallback(async () => {
    if (!currentContent) return;
    await navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [currentContent]);

  const handleDownload = useCallback(() => {
    if (!result) return;
    const ext = format === "json" ? "json" : format === "markdown" ? "md" : "txt";
    const blob = new Blob([result.output], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${result.filename.replace(/\.[^.]+$/, "")}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  }, [result, format]);

  if (isProcessing) return <ProcessingState />;
  if (!result) return <EmptyState />;

  return (
    <div className="flex flex-col h-full">
      {/* ── Result toolbar ── */}
      <div className="h-11 border-b border-zinc-200 flex items-center px-5 gap-4 shrink-0 bg-white">
        {/* Stats */}
        <div className="flex items-center gap-3 text-xs text-zinc-400 flex-1">
          <span className="flex items-center gap-1.5">
            <svg className="w-3 h-3 text-emerald-500" fill="currentColor" viewBox="0 0 8 8">
              <circle cx="4" cy="4" r="4" />
            </svg>
            {formatMs(result.elapsedMs)}
          </span>
          <span className="text-zinc-200">|</span>
          <span>{result.pageCount} {result.pageCount === 1 ? "page" : "pages"}</span>
          <span className="text-zinc-200">|</span>
          <span>{formatBytes(result.filesize)}</span>
          <span className="text-zinc-200">|</span>
          <span className="font-medium text-zinc-500 capitalize">{result.format}</span>
        </div>

        {/* View toggle (markdown only) */}
        {format === "markdown" && (
          <div className="flex items-center h-7 bg-zinc-100 rounded p-0.5 gap-0.5">
            {(["rendered", "raw"] as const).map((m) => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={`px-2.5 h-6 rounded text-xs font-medium transition-colors capitalize ${
                  viewMode === m
                    ? "bg-white text-zinc-900 shadow-xs"
                    : "text-zinc-500 hover:text-zinc-700"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleCopy}
            className="h-7 px-2.5 text-xs font-medium rounded border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors flex items-center gap-1.5"
          >
            {copied ? (
              <>
                <svg className="w-3 h-3 text-emerald-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Copied
              </>
            ) : (
              <>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <rect x="8" y="8" width="13" height="13" rx="2" />
                  <path d="M4 16V4a2 2 0 012-2h12" />
                </svg>
                Copy
              </>
            )}
          </button>
          <button
            onClick={handleDownload}
            className="h-7 px-2.5 text-xs font-medium rounded border border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 transition-colors flex items-center gap-1.5"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
            </svg>
            Save
          </button>
        </div>
      </div>

      {/* ── Page tabs (multi-page PDFs) ── */}
      {result.pages.length > 1 && (
        <div className="h-9 border-b border-zinc-200 flex items-center px-5 gap-1 bg-zinc-50 shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab(-1)}
            className={`px-3 h-6 rounded text-xs font-medium whitespace-nowrap transition-colors ${
              activeTab === -1
                ? "bg-zinc-900 text-white"
                : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200"
            }`}
          >
            All
          </button>
          {result.pages.map((p, i) => (
            <button
              key={i}
              onClick={() => setActiveTab(i)}
              className={`px-3 h-6 rounded text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === i
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200"
              }`}
            >
              p.{p.page + 1}
            </button>
          ))}
        </div>
      )}

      {/* ── Content ── */}
      <div className="flex-1 overflow-auto scrollbar-thin bg-white">
        {format === "json" ? (
          <pre className="p-6 text-xs font-mono text-zinc-700 leading-relaxed whitespace-pre-wrap break-all">
            {(() => { try { return JSON.stringify(JSON.parse(currentContent), null, 2); } catch { return currentContent; } })()}
          </pre>
        ) : format === "text" ? (
          <pre className="p-6 text-sm font-mono text-zinc-700 leading-relaxed whitespace-pre-wrap">
            {currentContent}
          </pre>
        ) : viewMode === "raw" ? (
          <pre className="p-6 text-xs font-mono text-zinc-700 leading-relaxed whitespace-pre-wrap">
            {currentContent}
          </pre>
        ) : (
          <div className="p-6 prose-ocr max-w-none">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {currentContent}
            </ReactMarkdown>
          </div>
        )}
      </div>

      {/* ── Bottom bar ── */}
      <div className="h-8 border-t border-zinc-100 px-5 flex items-center gap-3 bg-zinc-50 shrink-0">
        <p className="text-xs text-zinc-400 truncate" title={result.filename}>{result.filename}</p>
        <div className="flex-1" />
        <p className="text-xs text-zinc-300">
          {currentContent.split(/\s+/).filter(Boolean).length} words
          {" · "}
          {currentContent.length} chars
        </p>
      </div>
    </div>
  );
}
