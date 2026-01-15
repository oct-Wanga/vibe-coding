export const projectKeys = {
  all: () => ["project"] as const,

  lists: () => [...projectKeys.all(), "list"] as const,
  list: (params: { q?: string; status?: "active" | "archived" | "all" }) =>
    [...projectKeys.lists(), params] as const,

  details: () => [...projectKeys.all(), "detail"] as const,
  detail: (id: string) => [...projectKeys.details(), id] as const,
} as const;
