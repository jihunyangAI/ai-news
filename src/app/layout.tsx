import type { Metadata } from "next";
import Link from "next/link";
import { Noto_Sans_KR } from "next/font/google";
import { ClerkProvider, Show, UserButton } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Suspense } from "react";
import "./globals.css";

// Korean glyphs are split into many unicode-range files, so there is no single subset to preload
const notoSansKr = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  preload: false,
});

export const metadata: Metadata = {
  title: "AI뉴스 수집기",
  description: "해외 AI 뉴스를 한국어로 요약해 카드로 보여줍니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider localization={koKR}>
      <html lang="ko" className={`${notoSansKr.variable} h-full antialiased`}>
        <body className="flex min-h-full flex-col font-sans">
          {/* Show reads the session at request time, so it must sit behind Suspense */}
          <Suspense fallback={null}>
            <Show when="signed-in">
              <header className="sticky top-0 z-10 border-b border-border bg-surface/90 backdrop-blur">
                <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
                  <Link href="/dashboard" className="text-lg font-bold tracking-tight">
                    AI뉴스 수집기
                  </Link>
                  <UserButton />
                </div>
              </header>
            </Show>
          </Suspense>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
