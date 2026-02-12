"use client";

import { useQuery } from "@tanstack/react-query";

import type { User } from "@/entities/user";

type MeResponse = {
  user: User | null;
};

async function fetchMe(): Promise<User | null> {
  const res = await fetch("/api/auth/me", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch user");
  const data = (await res.json()) as MeResponse;
  return data.user;
}

export function useMe() {
  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: fetchMe,
  });
}
