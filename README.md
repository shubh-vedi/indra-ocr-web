# ⚡ Indra OCR Web — Next.js 15 Application

A modern, product-grade web application built with **Next.js 15 (App Router)** and **Tailwind CSS** that runs [Indra OCR](https://huggingface.co/datalab-to/indra-ocr) — an ultra-compact ~1M parameter layout-aware OCR engine created by [Datalab](https://datalab.to) (the creators of Marker and Surya).

Runs **100% locally on CPU via ONNX Runtime**. No GPU required. No external cloud API calls. No data ever leaves your device.

---

## ✨ Features

- 📄 **Multi-Format Document Ingestion**: Process PDFs (single or multi-page) and images (`PNG`, `JPEG`, `WebP`, `TIFF`, `BMP`, `GIF`) up to 50 MB.
- 🎯 **Three Output Modes**:
  - **Markdown**: Formatted headings, structured tables (GFM), lists, and blockquotes with tabbed raw/rendered view.
  - **Plain Text**: Clean, linearized character stream.
  - **JSON**: Full metadata payload with rotation, skew, notes, and token mappings.
- 🔬 **LaTeX Math Mode**: Optional specialized mathematical expression recognition (`math=True`).
- 📑 **Multi-Page Tab Navigation**: Seamlessly navigate between individual pages or view the unified multi-page document.
- 📋 **One-Click Actions**: Instant clipboard copy and file export (`.md`, `.txt`, `.json`).
- 🧪 **Pre-loaded Test Suite**: 5 ready-to-test benchmark documents (invoices, research papers, legal contracts, store receipts, hardware specs).
- 🎨 **Production Design**: Linear/Vercel-inspired monochrome UI typography using Geist Sans & Mono.

---

## 🛠️ Architecture

```
┌────────────────────────────────────────────────────────┐
│  Browser / Client (Next.js 15 + React 18)              │
│  - FileUploadZone (react-dropzone + 1-click samples)   │
│  - OptionsPanel (Format selector + Math mode toggle)   │
│  - OCRResult (ReactMarkdown + tabs + stats)            │
└────────────────────────────────────────────────────────┘
                           │
             POST /api/ocr (multipart/form-data)
                           ▼
┌────────────────────────────────────────────────────────┐
│  Next.js Server API Route (app/api/ocr/route.ts)       │
│  - Temp file ingestion & validation                    │
│  - Asynchronous child process dispatch                 │
└────────────────────────────────────────────────────────┘
                           │
             Subprocess: python3 -c "import indra_ocr..."
                           ▼
┌────────────────────────────────────────────────────────┐
│  Indra OCR Engine (Python 3 / ONNX Runtime)            │
│  - Sub-1M parameter vision transformer                 │
│  - CPU-optimized execution (< 1.5s per document)       │
│  - Returns clean Markdown / Text / Metadata            │
└────────────────────────────────────────────────────────┘
```

---

## 📋 Prerequisites

1. **Node.js**: `v18.17.0` or higher (recommended: `v20+` or `v22+`)
2. **Python**: `3.10` to `3.13` with `pip`
3. **Indra OCR**:
   ```bash
   pip install indra-ocr
   ```
   > **Note:** The ONNX model weights (~18 MB) are automatically fetched from Hugging Face (`datalab-to/indra-ocr`) and cached locally in `~/.cache/huggingface/hub/` upon first run.

---

## 🚀 Quick Start

### 1. Clone the repository
```bash
git clone https://github.com/shubh-vedi/indra-ocr-web.git
cd indra-ocr-web
```

### 2. Install dependencies
```bash
# Install Python OCR backend
pip install indra-ocr

# Install Node dependencies
npm install
```

### 3. Start the development server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Pre-Loaded Test Documents

The repository includes ready-to-test sample documents in [`test_samples/`](./test_samples) and [`public/samples/`](./public/samples):

| Document | Type | Pages | What it tests |
|---|---|---|---|
| `01_business_invoice.pdf` | PDF | 1 | Itemized corporate invoice, line-item tables, subtotal/tax calculations |
| `02_academic_research_paper.pdf` | PDF | 2 | Scientific paper with abstract, loss equations ($L_{seq}$), and benchmark tables |
| `03_legal_service_contract_3pages.pdf` | PDF | 3 | Multi-page enterprise SLA contract with legal clauses and signatures |
| `04_grocery_store_receipt.png` | PNG | 1 | Retail supermarket receipt with monospace fonts, prices, and barcodes |
| `05_hardware_spec_sheet.png` | PNG | 1 | Engineering transducer spec sheet with electrical pinout tables |

> In the web app, you can click on any sample under **"Test Samples"** in the sidebar to load and run OCR with a single click!

---

## 🔌 API Reference

### `POST /api/ocr`

Uploads and processes a document.

#### Request (multipart/form-data)
| Parameter | Type | Required | Default | Description |
|---|---|---|---|---|
| `file` | `File` | Yes | — | Document file (PDF, PNG, JPG, WebP, TIFF, BMP, GIF) |
| `format` | `string` | No | `markdown` | Desired output: `markdown`, `text`, or `json` |
| `math` | `boolean` | No | `false` | Enable LaTeX mathematical parsing |

#### Response (JSON)
```json
{
  "success": true,
  "output": "# Page 1\n\nExtracted content...",
  "pages": [
    {
      "page": 0,
      "content": "Extracted content for page 1..."
    }
  ],
  "format": "markdown",
  "filename": "01_business_invoice.pdf",
  "filesize": 3280,
  "pageCount": 1,
  "elapsedMs": 1213
}
```

---

### `GET /api/ocr`

Health check and runtime verification endpoint.

#### Response (JSON)
```json
{
  "status": "ok",
  "indraOcrInstalled": true,
  "indraOcrVersion": "0.3.2",
  "pythonCommand": "python3",
  "supportedFormats": ["markdown", "text", "json"],
  "maxFileSizeMB": 50
}
```

---

## 📁 Repository Structure

```
indra-ocr-web/
├── app/
│   ├── api/
│   │   └── ocr/
│   │       └── route.ts         # Server-side OCR execution endpoint
│   ├── globals.css              # Design tokens and custom styles
│   ├── layout.tsx               # Root layout with Geist font
│   └── page.tsx                 # Full-height application shell
├── components/
│   ├── FileUploadZone.tsx       # Dropzone uploader & 1-click test sample picker
│   ├── OCRApp.tsx               # Primary state management and dual-panel layout
│   ├── OCRResult.tsx            # Result viewer with tabs, markdown renderer & export
│   └── OptionsPanel.tsx         # Format and math mode toggles
├── public/
│   └── samples/                 # Sample documents served for web test picker
├── test_samples/                # Local sample PDFs and images for testing
├── scripts/
│   └── generate_samples.py      # Python script used to generate realistic test data
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration
└── package.json
```

---

## 📜 License

MIT License. See [LICENSE](LICENSE) for details.

Powered by [Indra OCR](https://huggingface.co/datalab-to/indra-ocr) by Datalab.
