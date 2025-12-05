import type { Metadata, Viewport } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export const metadata: Metadata = {
  title: "NezarAI",
  description: "NezarAI - Asisten AI Cerdas Berbahasa Indonesia",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "NezarAI",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/avatar-ai.png", sizes: "any", type: "image/png" },
    ],
    shortcut: "/avatar-ai.png",
    apple: [
      { url: "/avatar-ai.png", sizes: "any", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="dark" suppressHydrationWarning>
      <body
        className={`${geistMono.variable} antialiased bg-[#0a0a0a] text-[var(--foreground)]`}
      >
        <Providers>
          <div className="page-loaded">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
