import type { ReactNode } from "react";

type Props = {
  title: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function DashboardLayout({ title, actions, children }: Props) {
  return (
    <section className="space-y-4">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">{title}</h1>
        <div>{actions}</div>
      </header>
      <div className="rounded-lg border p-4">{children}</div>
    </section>
  );
}
