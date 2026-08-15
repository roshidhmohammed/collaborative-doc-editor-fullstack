import type { Metadata } from "next";
import "./globals.css";
import SonnerProvider from "../providers/Toast";
import { lusitana } from "@/lib/fonts";
import QueryProvider from "@/providers/QueryProvider";

/**
 * Resolves the site's metadataBase URL for Next.js.
 *
 * Priority:
 *   1. NEXT_PUBLIC_BASE_URL  (must be a fully-qualified URL, e.g. https://example.com)
 *   2. VERCEL_URL            (injected by Vercel at runtime — prefixed with https://)
 *   3. http://localhost:3000 (safe build-time fallback)
 *
 * Each candidate is tested with `new URL()` so a misconfigured env var
 * (e.g. missing protocol) never crashes the build.
 */
function resolveMetadataBase(): URL {
  const candidates: (string | undefined)[] = [
    process.env.NEXT_PUBLIC_BASE_URL?.trim(),
    process.env.VERCEL_URL?.trim()
      ? `https://${process.env.VERCEL_URL.trim()}`
      : undefined,
    "http://localhost:3000",
  ];

  for (const candidate of candidates) {
    if (!candidate) continue;
    try {
      return new URL(candidate);
    } catch {
      // invalid URL — try the next candidate
    }
  }

  // Guaranteed-valid final fallback (never reached in practice)
  return new URL("http://localhost:3000");
}

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),

  title: {
    default: "Real-Time Collaborative Document Editor",
    template: "%s | Collaborative Document Editor",
  },

  description:
    "Create, edit, and collaborate on documents in real time with your team. A fast, secure online document editor with live collaboration and document sharing.",

  keywords: [
    "collaborative document editor",
    "real-time document editor",
    "online document editor",
    "real-time collaboration",
    "document collaboration",
    "online collaboration",
    "team document editor",
    "shared documents",
    "collaborative workspace",
  ],

  applicationName: "Collaborative Document Editor",

  authors: [
    {
      name: "Collaborative Document Editor",
    },
  ],

  creator: "Collaborative Document Editor",
  publisher: "Collaborative Document Editor",

  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },

  alternates: {
    canonical: "/",
  },

  robots: {
    index: true,
    follow: true,
  },

  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Collaborative Document Editor",
    title: "Real-Time Collaborative Document Editor",
    description:
      "Create, edit, and collaborate on documents in real time with your team.",
  },

  twitter: {
    card: "summary_large_image",
    title: "Real-Time Collaborative Document Editor",
    description:
      "Create, edit, and collaborate on documents in real time with your team.",
  },

  icons: {
    icon: [
      {
        url: "/favicon.ico",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={` ${lusitana.className} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <SonnerProvider />
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
