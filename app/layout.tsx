import type { Metadata } from "next";
import { Geist } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ハンドボール部サポーター | 全国の学生ハンドボール部を応援しよう",
  description: "全国の学生ハンドボール部に気軽に寄付・応援ができるプラットフォームです。",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
            <Link href="/" className="font-bold text-blue-600 text-lg tracking-tight">
              🤾 ハンドボール部サポーター
            </Link>
            <nav className="flex gap-4 text-sm font-medium text-gray-600">
              <Link href="/teams" className="hover:text-blue-600 transition-colors">部活を探す</Link>
              <Link href="/admin" className="hover:text-blue-600 transition-colors">管理者</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="bg-white border-t border-gray-100 text-center text-xs text-gray-400 py-6 mt-12">
          © 2025 ハンドボール部サポーター
        </footer>
      </body>
    </html>
  );
}
