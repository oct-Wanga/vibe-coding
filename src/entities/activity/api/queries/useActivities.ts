"use client";

import { useQuery } from "@tanstack/react-query";

import type { Activity } from "@/entities/activity";

async function fetchActivities(): Promise<Activity[]> {
  const res = await fetch("/api/activity", { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch activity");
  return (await res.json()) as Activity[];
}

export function useActivities() {
  return useQuery({
    queryKey: ["activity", "recent"],
    queryFn: fetchActivities,
  });
}
