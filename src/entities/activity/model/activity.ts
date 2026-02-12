export type ActivityType = "project" | "team" | "system";

export type Activity = {
  id: string;
  type: ActivityType;
  message: string;
  actor?: {
    id: string;
    name: string;
  };
  createdAt: string;
};
