// @flow
import * as React from "react";

import { MarketingLinkBox } from "./MarketingLinkBox";

export const MarketingPage = ({ children }: { children: React.ReactNode }) => {
  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold">Next.js Conventions Example</h1>
        <p className="text-sm text-gray-600">
          This sample demonstrates src/ 구조 + (route groups) +
          views/widgets/features/entities/shared 레이어와 Public API(import) 컨벤션을 적용한
          예시입니다.
        </p>
      </header>

      <MarketingLinkBox />

      <section className="rounded-lg p-4 ">{children}</section>
    </main>
  );
};
