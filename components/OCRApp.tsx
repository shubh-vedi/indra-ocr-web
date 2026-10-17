"use client";

import { useState, useCallback, useEffect } from "react";
import { FileUploadZone } from "./FileUploadZone";
import { OCRResult } from "./OCRResult";
import { OptionsPanel } from "./OptionsPanel";

export type OutputFormat = "markdown" | "text" | "json";

export interface OCRResponse {
  success: boolean;
  output: string;
  pages: Array<{ page: number; content: string }>;
  format: OutputFormat;
  filename: string;
  filesize: number;
  pageCount: number;
  elapsedMs: number;
  error?: string;
  details?: string;
  installCommand?: string;
}

export interface HealthStatus {
  status: "ok" | "error" | "loading";
  indraOcrInstalled?: boolean;
  indraOcrVersion?: string | null;
  installCommand?: string;
}

export function OCRApp() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<OutputFormat>("markdown");
  const [mathMode, setMathMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<OCRResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [health, setHealth] = useState<HealthStatus>({ status: "loading" });

  useEffect(() => {
    fetch("/api/ocr")
      .then((r) => r.json())
      .then((data) => {
        setHealth({
          status: data.status === "ok" ? "ok" : "error",
          indraOcrInstalled: data.indraOcrInstalled,
          indraOcrVersion: data.indraOcrVersion,
          installCommand: data.installCommand,
        });
      })
      .catch(() => setHealth({ status: "error" }));
  }, []);

  const handleFileSelect = useCallback((f: File) => {
    setFile(f);
    setResult(null);
    setError(null);
  }, []);

  const handleClear = useCallback(() => {
    setFile(null);
    setResult(null);
    setError(null);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!file) return;
    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("format", format);
      fd.append("math", String(mathMode));

      const res = await fetch("/api/ocr", { method: "POST", body: fd });
      const data: OCRResponse = await res.json();

      if (!res.ok || !data.success) {
        setError(
          data.installCommand
            ? `${data.error}\n\nFix: ${data.installCommand}`
            : data.error || "Processing failed."
        );
      } else {
        setResult(data);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Network error.");
    } finally {
      setIsProcessing(false);
    }
  }, [file, format, mathMode]);

  const canRun = !!file && !isProcessing && health.indraOcrInstalled !== false;

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50">
      {/* ── Top bar ── */}
      <header className="h-14 border-b border-zinc-200 bg-white flex items-center px-6 gap-4 shrink-0">
        {/* Brand */}
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 bg-zinc-900 rounded flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <rect x="3" y="3" width="8" height="8" rx="1" />
              <rect x="13" y="3" width="8" height="8" rx="1" />
              <rect x="3" y="13" width="8" height="8" rx="1" />
              <path strokeLinecap="round" d="M13 17h8" />
              <path strokeLinecap="round" d="M17 13v8" />
            </svg>
          </div>
          <span className="font-semibold text-sm tracking-tight text-zinc-900">Indra OCR</span>
        </div>

        <div className="w-px h-5 bg-zinc-200 mx-0.5" />

        {/* Model badge */}
        <span className="text-xs text-zinc-400 font-medium">datalab-to / indra-ocr</span>

        <div className="flex-1" />

        {/* Status pill */}
        {health.status === "loading" && (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 animate-pulse" />
            <span className="text-xs text-zinc-400">Checking…</span>
          </div>
        )}
        {health.status === "ok" && health.indraOcrInstalled && (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-xs text-zinc-500">v{health.indraOcrVersion}</span>
          </div>
        )}
        {(health.status === "error" || health.indraOcrInstalled === false) && (
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span className="text-xs text-zinc-500">Not installed</span>
          </div>
        )}

        <a
          href="https://huggingface.co/datalab-to/indra-ocr"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
          </svg>
          HuggingFace
        </a>
      </header>

      {/* ── Install notice ── */}
      {health.indraOcrInstalled === false && (
        <div className="border-b border-amber-100 bg-amber-50 px-6 py-2.5 flex items-center gap-3">
          <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-xs text-amber-800">
            <span className="font-medium">indra-ocr is not installed.</span>{" "}
            Run{" "}
            <code className="font-mono bg-amber-100 border border-amber-200 rounded px-1.5 py-0.5 text-amber-900">
              pip install indra-ocr
            </code>{" "}
            in your terminal, then refresh.
          </p>
        </div>
      )}

      {/* ── Main ── */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-72 shrink-0 border-r border-zinc-200 bg-white flex flex-col overflow-y-auto">
          <div className="p-5 space-y-5 flex-1">
            {/* Upload */}
            <FileUploadZone
              file={file}
              onFileSelect={handleFileSelect}
              onClear={handleClear}
              isProcessing={isProcessing}
            />

            {/* Divider */}
            <div className="border-t border-zinc-100" />

            {/* Options */}
            <OptionsPanel
              format={format}
              mathMode={mathMode}
              onFormatChange={setFormat}
              onMathModeChange={setMathMode}
              disabled={isProcessing}
            />

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                <p className="text-xs font-medium text-red-700 mb-1">Error</p>
                <pre className="text-xs text-red-600 whitespace-pre-wrap font-mono leading-relaxed">{error}</pre>
              </div>
            )}
          </div>

          {/* Run button — pinned at bottom */}
          <div className="p-4 border-t border-zinc-100">
            <button
              onClick={handleSubmit}
              disabled={!canRun}
              className={`
                w-full h-9 rounded-md text-sm font-medium flex items-center justify-center gap-2
                transition-all duration-150
                ${canRun
                  ? "bg-zinc-900 text-white hover:bg-zinc-700 active:scale-[0.98] cursor-pointer"
                  : "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                }
              `}
            >
              {isProcessing ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Processing…
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Run OCR
                </>
              )}
            </button>
          </div>
        </aside>

        {/* Result panel */}
        <main className="flex-1 overflow-hidden flex flex-col min-w-0">
          <OCRResult result={result} isProcessing={isProcessing} format={format} />
        </main>
      </div>
    </div>
  );
}
