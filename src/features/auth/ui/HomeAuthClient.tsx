"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { ScreenRtc } from "@/features/rtc";
import { setParam } from "@/shared/lib/searchParams";
import { Button, Card, CardContent, CardHeader, CardTitle } from "@/shared/ui";

import { LoginForm } from "./LoginForm";
import { SignupForm } from "./SignupForm";

type Mode = "login" | "signup";

function isMode(v: string | null): v is Mode {
  return v === "login" || v === "signup";
}

export function HomeAuthClient({ initialMode }: { initialMode: Mode }) {
  const router = useRouter();
  const pathname = usePathname(); // "/"
  const sp = useSearchParams();

  const mode: Mode = useMemo(() => {
    const v = sp.get("auth");
    return isMode(v) ? v : initialMode;
  }, [sp, initialMode]);

  const go = (nextMode: Mode) => {
    const next = new URLSearchParams(sp.toString());
    // login은 기본값이라 쿼리 제거해서 URL 깔끔하게 유지
    setParam(next, "auth", nextMode === "login" ? undefined : "signup");

    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname);
  };

  return (
    <div className="mx-auto max-w-md p-6" data-testid={"auth-shell"}>
      <Card>
        <CardHeader className="space-y-3">
          <CardTitle>
            <span data-testid={"auth-mode"}>{mode === "login" ? "Sign in" : "Create account"}</span>
          </CardTitle>

          <div className="flex gap-2">
            <Button
              type="button"
              data-testid={"auth-tab-login"}
              variant={mode === "login" ? "default" : "secondary"}
              onClick={() => go("login")}
            >
              Login
            </Button>
            <Button
              type="button"
              data-testid={"auth-tab-signup"}
              variant={mode === "signup" ? "default" : "secondary"}
              onClick={() => go("signup")}
            >
              Sign up
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {mode === "login" ? <LoginForm /> : <SignupForm />}
        </CardContent>
      </Card>
      <div>
        <ScreenRtc />
      </div>
    </div>
  );
}
