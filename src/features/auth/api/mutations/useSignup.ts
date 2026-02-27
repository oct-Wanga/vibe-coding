"use client";

import { useMutation } from "@tanstack/react-query";

import type { SignupInput } from "@/features/auth";

type SignupResponse =
  | { ok: true; userId: string | null; needsEmailConfirm: boolean }
  | { ok: false; message: string };

async function signupRequest(input: SignupInput): Promise<SignupResponse> {
  const res = await fetch("/api/auth/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ email: input.email, password: input.password }),
  });

  const data = (await res.json().catch(() => ({}))) as Partial<{
    ok: boolean;
    message: string;
    detail: string;
    userId: string | null;
    needsEmailConfirm: boolean;
  }>;

  if (!res.ok) return { ok: false, message: data.message ?? data.detail ?? "HTTP error" };

  return {
    ok: true,
    userId: data.userId ?? null,
    needsEmailConfirm: Boolean(data.needsEmailConfirm),
  };
}

export function useSignup() {
  return useMutation({
    mutationFn: signupRequest,
  });
}
