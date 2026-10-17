"use client";

import type { OutputFormat } from "./OCRApp";

interface OptionsPanelProps {
  format: OutputFormat;
  mathMode: boolean;
  onFormatChange: (f: OutputFormat) => void;
  onMathModeChange: (v: boolean) => void;
  disabled: boolean;
}

const FORMATS: { value: OutputFormat; label: string; description: string }[] = [
  { value: "markdown", label: "Markdown", description: "Rich text with headings, tables, code blocks" },
  { value: "text",     label: "Plain text", description: "Raw extracted text content" },
  { value: "json",     label: "JSON",       description: "Structured metadata + content" },
];

export function OptionsPanel({ format, mathMode, onFormatChange, onMathModeChange, disabled }: OptionsPanelProps) {
  return (
    <div className="space-y-5">
      {/* Output format */}
      <div>
        <p className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wide">Output format</p>
        <div className="space-y-1">
          {FORMATS.map((f) => (
            <button
              key={f.value}
              onClick={() => onFormatChange(f.value)}
              disabled={disabled}
              className={`
                w-full flex items-center gap-3 px-3 py-2 rounded-md text-left
                transition-colors duration-100 disabled:opacity-50 disabled:cursor-not-allowed
                ${format === f.value
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                }
              `}
            >
              {/* Radio dot */}
              <span className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                format === f.value
                  ? "border-zinc-500 bg-zinc-700"
                  : "border-zinc-300 bg-white"
              }`}>
                {format === f.value && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
              </span>
              <div>
                <p className="text-xs font-medium leading-tight">{f.label}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Math mode */}
      <div>
        <p className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wide">Options</p>
        <div className="flex items-center justify-between px-3 py-2.5 rounded-md border border-zinc-200 bg-white">
          <div>
            <p className="text-xs font-medium text-zinc-800">Math mode</p>
            <p className="text-xs text-zinc-400 mt-0.5">LaTeX math parsing</p>
          </div>
          <button
            role="switch"
            aria-checked={mathMode}
            onClick={() => !disabled && onMathModeChange(!mathMode)}
            disabled={disabled}
            className={`
              relative w-9 h-5 rounded-full transition-colors duration-200
              disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none
              ${mathMode ? "bg-zinc-900" : "bg-zinc-200"}
            `}
          >
            <span className={`
              absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-xs
              transition-transform duration-200
              ${mathMode ? "translate-x-4" : "translate-x-0"}
            `} />
          </button>
        </div>
      </div>

      {/* Info row */}
      <div className="flex items-center gap-3 text-xs text-zinc-400">
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Local
        </span>
        <span>·</span>
        <span>1M params</span>
        <span>·</span>
        <span>ONNX CPU</span>
      </div>
    </div>
  );
}
