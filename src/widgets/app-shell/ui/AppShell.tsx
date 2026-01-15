import type { ReactNode } from "react";

import { AppHeader } from "@/widgets/header";
import { Sidebar } from "@/widgets/sidebar";

type Props = { children: ReactNode };

export function AppShell({ children }: Props) {
  return (
    <div className="min-h-dvh">
      <AppHeader />
      <div className="mx-auto flex max-w-6xl gap-6 p-4">
        <aside className="w-64 shrink-0">
          <Sidebar />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
