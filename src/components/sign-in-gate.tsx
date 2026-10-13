"use client";

import { SignInButton, useAuth, useClerk } from "@clerk/nextjs";
import { useEffect } from "react";

// Shown to signed-out users: opens the sign-in modal on arrival,
// and keeps a button to reopen it if the modal is dismissed.
export function SignInGate() {
  const { isLoaded, isSignedIn } = useAuth();
  const clerk = useClerk();

  useEffect(() => {
    if (isLoaded && !isSignedIn) clerk.openSignIn();
  }, [isLoaded, isSignedIn, clerk]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 px-4 text-center">
      <h1 className="text-2xl font-semibold">AI 뉴스 요약</h1>
      <p className="text-zinc-600 dark:text-zinc-400">로그인 후 이용할 수 있습니다.</p>
      <SignInButton mode="modal">
        <button className="rounded-full bg-foreground px-6 py-2.5 font-medium text-background">
          로그인
        </button>
      </SignInButton>
    </main>
  );
}
