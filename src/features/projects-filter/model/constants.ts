export const PROJECT_STATUS = ["all", "active", "archived"] as const;
export type ProjectStatus = (typeof PROJECT_STATUS)[number];
