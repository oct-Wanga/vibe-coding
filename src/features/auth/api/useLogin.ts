"use client";

import { useMutation } from "@tanstack/react-query";

import type { LoginInput } from "@/features/auth";

import { authKeys } from "../model/keys";

type LoginResponse = { ok: true } | { ok: false; message: string };

type ApiError = { message: string; status: number; details?: unknown };

async function loginRequest(input: LoginInput): Promise<LoginResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    // 서버가 {message}를 준다는 가정이 없으면 안전하게 처리
    const message =
      (() => {
        try {
          const json = text ? (JSON.parse(text) as { message?: unknown }) : null;
          return typeof json?.message === "string" ? json.message : null;
        } catch {
          return null;
        }
      })() ??
      res.statusText ??
      "Login failed";

    // React Query에선 throw로 에러 상태로 보내는 게 표준
    const err: ApiError = { message, status: res.status, details: text };
    throw err;
  }

  return { ok: true };
}

export function useLogin() {
  return useMutation({
    mutationKey: authKeys.login(),
    mutationFn: loginRequest,
  });
}
