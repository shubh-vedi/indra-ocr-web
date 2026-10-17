"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploadZoneProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  onClear: () => void;
  isProcessing: boolean;
}

const ACCEPT = {
  "application/pdf": [".pdf"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/webp": [".webp"],
  "image/tiff": [".tiff", ".tif"],
  "image/bmp": [".bmp"],
  "image/gif": [".gif"],
};

export const SAMPLE_FILES = [
  {
    id: "invoice",
    title: "Business Invoice",
    filename: "01_business_invoice.pdf",
    url: "/samples/01_business_invoice.pdf",
    mime: "application/pdf",
    desc: "1 page · Tables & billing totals",
    badge: "PDF",
    badgeColor: "bg-red-50 text-red-700 border-red-200",
  },
  {
    id: "paper",
    title: "Research Paper",
    filename: "02_academic_research_paper.pdf",
    url: "/samples/02_academic_research_paper.pdf",
    mime: "application/pdf",
    desc: "2 pages · Math formulas & tables",
    badge: "PDF",
    badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
  },
  {
    id: "contract",
    title: "Legal Contract",
    filename: "03_legal_service_contract_3pages.pdf",
    url: "/samples/03_legal_service_contract_3pages.pdf",
    mime: "application/pdf",
    desc: "3 pages · Multi-page SLA & clauses",
    badge: "PDF",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    id: "receipt",
    title: "Grocery Receipt",
    filename: "04_grocery_store_receipt.png",
    url: "/samples/04_grocery_store_receipt.png",
    mime: "image/png",
    desc: "Image · Itemized store receipt",
    badge: "PNG",
    badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  {
    id: "specsheet",
    title: "Hardware Spec Sheet",
    filename: "05_hardware_spec_sheet.png",
    url: "/samples/05_hardware_spec_sheet.png",
    mime: "image/png",
    desc: "Image · Technical pinouts & specs",
    badge: "PNG",
    badgeColor: "bg-amber-50 text-amber-700 border-amber-200",
  },
];

function formatBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1048576) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1048576).toFixed(2)} MB`;
}

export function FileUploadZone({ file, onFileSelect, onClear, isProcessing }: FileUploadZoneProps) {
  const [rejection, setRejection] = useState<string | null>(null);
  const [loadingSample, setLoadingSample] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejections: { errors: { message: string }[] }[]) => {
      setRejection(null);
      if (rejections.length > 0) {
        setRejection(rejections[0].errors[0].message);
        return;
      }
      if (accepted[0]) onFileSelect(accepted[0]);
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPT,
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024,
    disabled: isProcessing,
    multiple: false,
  });

  const handleSelectSample = async (sample: typeof SAMPLE_FILES[0]) => {
    if (isProcessing) return;
    try {
      setLoadingSample(sample.id);
      const res = await fetch(sample.url);
      const blob = await res.blob();
      const sampleFile = new File([blob], sample.filename, { type: sample.mime });
      onFileSelect(sampleFile);
    } catch (e) {
      setRejection("Failed to load sample document.");
    } finally {
      setLoadingSample(null);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium text-zinc-500 mb-2 uppercase tracking-wide">Document</p>
        
        {file ? (
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
            <div className="flex items-start gap-3">
              <div
                className={`w-9 h-10 rounded flex items-center justify-center shrink-0 ${
                  file.type === "application/pdf"
                    ? "bg-red-50 border border-red-100"
                    : "bg-blue-50 border border-blue-100"
                }`}
              >
                {file.type === "application/pdf" ? (
                  <svg className="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-800 truncate" title={file.name}>
                  {file.name}
                </p>
                <p className="text-xs text-zinc-400 mt-0.5">{formatBytes(file.size)}</p>
              </div>
              {!isProcessing && (
                <button
                  onClick={onClear}
                  className="w-6 h-6 rounded flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors shrink-0"
                  title="Remove file"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div
            {...getRootProps()}
            className={`
              rounded-lg border-2 border-dashed p-6 text-center cursor-pointer select-none
              transition-all duration-150
              ${
                isDragActive
                  ? "border-zinc-400 bg-zinc-50"
                  : "border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/50"
              }
              ${isProcessing ? "pointer-events-none opacity-50" : ""}
            `}
          >
            <input {...getInputProps()} />
            <div
              className={`mx-auto w-9 h-9 rounded-lg flex items-center justify-center mb-2.5 transition-colors ${
                isDragActive ? "bg-zinc-200" : "bg-zinc-100"
              }`}
            >
              <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <p className="text-xs font-medium text-zinc-700">
              {isDragActive ? "Drop to upload" : "Drop file or browse"}
            </p>
            <p className="text-[11px] text-zinc-400 mt-1">PDF, PNG, JPG, WebP, TIFF · Max 50 MB</p>
          </div>
        )}

        {rejection && <p className="mt-1.5 text-xs text-red-500">{rejection}</p>}
      </div>

      {/* ── Test Sample Selector ── */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Test Samples</p>
          <span className="text-[11px] text-zinc-400">Click to test</span>
        </div>
        <div className="space-y-1.5">
          {SAMPLE_FILES.map((sample) => {
            const isCurrent = file?.name === sample.filename;
            const isLoadingThis = loadingSample === sample.id;

            return (
              <button
                key={sample.id}
                type="button"
                onClick={() => handleSelectSample(sample)}
                disabled={isProcessing || isLoadingThis}
                className={`
                  w-full text-left p-2 rounded-md border text-xs transition-colors flex items-center justify-between gap-2
                  ${
                    isCurrent
                      ? "border-zinc-800 bg-zinc-900 text-white"
                      : "border-zinc-200 bg-white hover:border-zinc-300 hover:bg-zinc-50 text-zinc-700"
                  }
                  ${isProcessing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium truncate">{sample.title}</span>
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded border font-semibold ${
                        isCurrent ? "bg-zinc-800 text-zinc-200 border-zinc-700" : sample.badgeColor
                      }`}
                    >
                      {sample.badge}
                    </span>
                  </div>
                  <p className={`text-[10px] truncate mt-0.5 ${isCurrent ? "text-zinc-400" : "text-zinc-400"}`}>
                    {sample.desc}
                  </p>
                </div>
                {isLoadingThis ? (
                  <svg className="w-3.5 h-3.5 animate-spin text-zinc-400 shrink-0" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <span className={`text-[11px] shrink-0 ${isCurrent ? "text-zinc-300" : "text-zinc-400"}`}>
                    {isCurrent ? "Active" : "Use"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
