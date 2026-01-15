import Link from "next/link";

import { UserAvatar } from "@/entities/user";
import { routes } from "@/shared/config/routes";

const mockUser = { email: "user@example.com", name: "User", imageUrl: null };

export function AppHeader() {
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
          <UserAvatar user={mockUser} />
        </div>
      </div>
    </header>
  );
}
