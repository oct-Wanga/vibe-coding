"use client";

import {useMutation} from "@tanstack/react-query";
import {z} from "zod";

import type {LoginInput} from "@/features/auth";

import {authKeys} from "../model/keys";

type LoginResponse = { ok: true } | { ok: false; message?: string };
const errorSchema = z.object({message: z.string().optional()}).passthrough();

async function loginRequest(input: LoginInput): Promise<LoginResponse> {
  const res = await fetch("/api/auth/login", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(input),
  });

  const raw = await res.text();
  const data = raw ? (() => {
    try {
      return JSON.parse(raw);
    } catch {
      return undefined;
    }
  })() : undefined;

  if (!res.ok) {
    const parsed = errorSchema.safeParse(data);
    return {ok: false, message: parsed.success ? parsed.data.message ?? "HTTP error" : "HTTP error"};
  }

  return {ok: true};
}

export function useLogin() {
  return useMutation({
    mutationKey: authKeys.login(),
    mutationFn: loginRequest,
  });
}
