import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Indra OCR",
  description: "Extract text from PDFs and images with Indra OCR — a 1M parameter model running locally on your machine.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} h-full`}>
      <body className="h-full font-[family-name:var(--font-geist)] bg-white text-zinc-900">
        {children}
      </body>
    </html>
  );
}
