"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import { routes } from "@/shared/config/routes";
import { useUiStore } from "@/shared/stores/useUiStore";

const nav = [
  { label: "메인", href: routes.home },
  { label: "Dashboard", href: routes.dashboard },
  { label: "Projects", href: routes.projects },
  { label: "Discovery", href: routes.discovery },
  { label: "Canvas", href: routes.canvas },
];

export function SidebarClient({ children }: { children?: ReactNode }) {
  const { sidebarCollapsed, toggleSidebar } = useUiStore();

  return (
    <nav className="flex h-full flex-col rounded-lg border p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-xs font-semibold text-gray-500">MENU</div>
        <button className="text-xs underline" onClick={toggleSidebar} type="button">
          {sidebarCollapsed ? "Expand" : "Collapse"}
        </button>
      </div>

      {/* main */}
      <div className="flex-1">
        {!sidebarCollapsed ? (
          <ul className="space-y-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  className="block rounded px-2 py-1 text-sm hover:bg-gray-100"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-xs text-gray-500">Collapsed</div>
        )}
      </div>

      {/* footer slot */}
      {children ? <div className="mt-3 border-t pt-3">{children}</div> : null}
    </nav>
  );
}
