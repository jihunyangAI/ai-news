import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider, Show, UserButton } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { Suspense } from "react";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI 뉴스 요약",
  description: "해외 AI 뉴스를 한국어로 요약해 카드로 보여줍니다.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <ClerkProvider localization={koKR}>
      <html
        lang="ko"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          {/* Show reads the session at request time, so it must sit behind Suspense */}
          <Suspense fallback={null}>
            <Show when="signed-in">
              <header className="flex items-center justify-between border-b border-black/10 px-4 py-3 dark:border-white/15">
                <span className="font-semibold">AI 뉴스 요약</span>
                <UserButton />
              </header>
            </Show>
          </Suspense>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
