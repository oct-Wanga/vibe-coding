import { HomeAuthClient } from "@/features/auth/ui/HomeAuthClient";
import type { SearchParamsLike } from "@/shared/lib/searchParams";
import { getStringParam } from "@/shared/lib/searchParams";
import { MarketingPage } from "@/views/marketing";

type Mode = "login" | "signup";

function toMode(v: string): Mode {
  return v === "signup" ? "signup" : "login";
}

export default function HomePage({ searchParams }: { searchParams: SearchParamsLike }) {
  const sp = searchParams;
  const mode = toMode(getStringParam(sp, "auth") ?? "login");

  return (
    <MarketingPage>
      <HomeAuthClient initialMode={mode} />
    </MarketingPage>
  );
}
