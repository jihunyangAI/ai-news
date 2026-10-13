import { Show } from "@clerk/nextjs";
import { Suspense } from "react";
import { SignInGate } from "@/components/sign-in-gate";

export default function Home() {
  return (
    <Suspense fallback={null}>
      <Show when="signed-out">
        <SignInGate />
      </Show>
      <Show when="signed-in">
        <main className="flex flex-1 items-center justify-center px-4">
          <p className="text-zinc-600 dark:text-zinc-400">뉴스 목록이 여기에 표시됩니다.</p>
        </main>
      </Show>
    </Suspense>
  );
}
