import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "NezarAI",
  description: "NezarAI - Your Intelligent AI Assistant",
  icons: {
    icon: "/favicon.ico",
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
        <div className="page-loaded">
          {children}
        </div>
      </body>
    </html>
  );
}
