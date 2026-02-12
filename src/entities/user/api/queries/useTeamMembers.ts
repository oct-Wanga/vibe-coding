"use client";

import { useQuery } from "@tanstack/react-query";

import type { User } from "@/entities/user";

async function fetchTeamMembers(): Promise<User[]> {
  const res = await fetch("/api/team", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch team members");
  return (await res.json()) as User[];
}

export function useTeamMembers() {
  return useQuery({
    queryKey: ["team", "members"],
    queryFn: fetchTeamMembers,
  });
}
