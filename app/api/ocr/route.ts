import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import { writeFile, unlink, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import os from "os";

export const runtime = "nodejs";
export const maxDuration = 120; // 2 minute timeout for large PDFs

// Supported MIME types
const SUPPORTED_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
  "image/tiff",
  "image/bmp",
  "image/gif",
]);

// Max file size: 50MB
const MAX_SIZE_BYTES = 50 * 1024 * 1024;

type OutputFormat = "markdown" | "text" | "json";

/**
 * Runs indra-ocr via Python subprocess on the given file.
 * Returns { output, pages, elapsedMs }
 */
async function runIndraOCR(
  filePath: string,
  format: OutputFormat,
  math: boolean
): Promise<{ output: string; pages: PageResult[]; elapsedMs: number }> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();

    const script = /* python */ `
import sys
import json
import indra_ocr

try:
    conv = indra_ocr.load(math=${math ? "True" : "False"})
    pages = []
    for i, page in conv.convert(sys.argv[1]):
        if "${format}" == "markdown":
            content = page.markdown
        elif "${format}" == "json":
            content = json.dumps({
                "markdown": page.markdown,
                "text": page.text,
                "source": page.source if hasattr(page, 'source') else None,
                "note": page.note if hasattr(page, 'note') else None,
                "rotation": page.rotation if hasattr(page, 'rotation') else None,
                "skew": page.skew if hasattr(page, 'skew') else None,
            })
        else:
            content = page.text if hasattr(page, 'text') else page.markdown
        pages.append({"page": i, "content": content})
    
    print(json.dumps({"success": True, "pages": pages}))
except Exception as e:
    print(json.dumps({"success": False, "error": str(e)}))
`.trim();

    const proc = spawn("python3", ["-c", script, filePath], {
      env: { ...process.env, PYTHONUNBUFFERED: "1" },
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (chunk: Buffer) => {
      stdout += chunk.toString();
    });

    proc.stderr.on("data", (chunk: Buffer) => {
      stderr += chunk.toString();
    });

    proc.on("close", (code) => {
      const elapsedMs = Date.now() - startTime;

      if (code !== 0) {
        reject(
          new Error(
            `indra-ocr exited with code ${code}. stderr: ${stderr.slice(0, 500)}`
          )
        );
        return;
      }

      try {
        // Find the last JSON line (Python may print download progress to stdout)
        const lines = stdout.trim().split("\n");
        const jsonLine = lines.filter((l) => l.trim().startsWith("{")).pop();
        if (!jsonLine) {
          reject(new Error(`No JSON output from indra-ocr. stdout: ${stdout.slice(0, 500)}`));
          return;
        }

        const result = JSON.parse(jsonLine);
        if (!result.success) {
          reject(new Error(result.error || "Unknown indra-ocr error"));
          return;
        }

        const pages: PageResult[] = result.pages;
        // Combine all pages into one output string
        let combined = "";
        if (pages.length === 1) {
          combined = pages[0].content;
        } else {
          combined = pages
            .map((p) => `## Page ${p.page + 1}\n\n${p.content}`)
            .join("\n\n---\n\n");
        }

        resolve({ output: combined, pages, elapsedMs });
      } catch (e) {
        reject(new Error(`Failed to parse OCR output: ${e}. stdout: ${stdout.slice(0, 500)}`));
      }
    });

    proc.on("error", (err) => {
      reject(
        new Error(
          `Failed to spawn python3: ${err.message}. Make sure Python 3 is installed.`
        )
      );
    });
  });
}

export interface PageResult {
  page: number;
  content: string;
}

export async function POST(req: NextRequest) {
  const tmpDir = path.join(os.tmpdir(), "indra-ocr-uploads");

  // Ensure tmp dir exists
  if (!existsSync(tmpDir)) {
    await mkdir(tmpDir, { recursive: true });
  }

  let tmpFilePath: string | null = null;

  try {
    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const format = (formData.get("format") as OutputFormat) || "markdown";
    const math = formData.get("math") === "true";

    if (!file) {
      return NextResponse.json(
        { error: "No file provided. Send a multipart/form-data request with a 'file' field." },
        { status: 400 }
      );
    }

    // Validate file type
    if (!SUPPORTED_TYPES.has(file.type)) {
      return NextResponse.json(
        {
          error: `Unsupported file type: ${file.type}. Supported: PDF, PNG, JPEG, WebP, TIFF, BMP, GIF.`,
        },
        { status: 415 }
      );
    }

    // Validate file size
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max: 50 MB.` },
        { status: 413 }
      );
    }

    // Write file to temp directory
    const ext = file.name.split(".").pop() || "bin";
    const safeFilename = `upload_${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    tmpFilePath = path.join(tmpDir, safeFilename);

    const bytes = await file.arrayBuffer();
    await writeFile(tmpFilePath, Buffer.from(bytes));

    // Run OCR
    const { output, pages, elapsedMs } = await runIndraOCR(
      tmpFilePath,
      format,
      math
    );

    return NextResponse.json({
      success: true,
      output,
      pages,
      format,
      filename: file.name,
      filesize: file.size,
      pageCount: pages.length,
      elapsedMs,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("[OCR API Error]", message);

    // Check for common errors and give helpful messages
    if (message.includes("No module named 'indra_ocr'")) {
      return NextResponse.json(
        {
          error:
            "indra-ocr Python package is not installed. Run: pip install indra-ocr",
          details: message,
          installCommand: "pip install indra-ocr",
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: "OCR processing failed.", details: message },
      { status: 500 }
    );
  } finally {
    // Clean up temp file
    if (tmpFilePath) {
      unlink(tmpFilePath).catch(() => {});
    }
  }
}

// Health check
export async function GET() {
  // Check if indra-ocr is installed
  const checkScript = `
import sys
try:
    import indra_ocr
    print(indra_ocr.__version__ if hasattr(indra_ocr, '__version__') else 'installed')
except ImportError:
    print('not_installed')
`.trim();

  return new Promise<NextResponse>((resolve) => {
    const proc = spawn("python3", ["-c", checkScript]);
    let out = "";
    proc.stdout.on("data", (d: Buffer) => (out += d.toString()));
    proc.on("close", () => {
      const isInstalled = !out.includes("not_installed");
      resolve(
        NextResponse.json({
          status: "ok",
          indraOcrInstalled: isInstalled,
          indraOcrVersion: isInstalled ? out.trim() : null,
          pythonCommand: "python3",
          installCommand: "pip install indra-ocr",
          supportedFormats: ["markdown", "text", "json"],
          supportedTypes: Array.from(SUPPORTED_TYPES),
          maxFileSizeMB: 50,
        })
      );
    });
    proc.on("error", () => {
      resolve(
        NextResponse.json(
          { status: "error", error: "python3 not found in PATH" },
          { status: 503 }
        )
      );
    });
  });
}
