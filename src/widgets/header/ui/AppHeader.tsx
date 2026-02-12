"use client";

import Link from "next/link";

import { useMe, UserAvatar } from "@/entities/user";
import { routes } from "@/shared/config/routes";

export function AppHeader() {
  const meQuery = useMe();
  const me = meQuery.data;

  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
        <Link href={routes.home} className="font-semibold">
          MyApp
        </Link>

        <div className="flex items-center gap-3">
          <Link href={routes.dashboard} className="text-sm text-gray-600 hover:underline">
            Dashboard
          </Link>
          {me ? <UserAvatar user={me} /> : null}
        </div>
      </div>
    </header>
  );
}
