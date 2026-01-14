import Link from "next/link";

import {LoginForm} from "@/features/auth";

export default function MarketingHome() {
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Next.js Conventions Example</h1>
        <p className="text-sm text-gray-600">
          This sample demonstrates src/ 구조 + (route groups) + views/widgets/features/entities/shared 레이어와
          Public API(import) 컨벤션을 적용한 예시입니다.
        </p>
      </header>

      <section className="flex gap-3 text-sm">
        <Link className="underline" href="/dashboard">/dashboard</Link>
        <Link className="underline" href="/projects">/projects</Link>
        <Link className="underline" href="/api/health">/api/health</Link>
      </section>

      <section className="rounded-lg border p-4">
        <h2 className="mb-3 text-lg font-semibold">Login (feature 예시)</h2>
        <LoginForm/>
      </section>
    </main>
  );
}
