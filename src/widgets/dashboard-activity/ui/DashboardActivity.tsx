import type { ActivityType } from "@/entities/activity";
import { useActivities } from "@/entities/activity";
import { Badge, Card, CardContent, CardHeader, CardTitle, EmptyState } from "@/shared/ui";

const typeStyles: Record<ActivityType, { label: string; className: string }> = {
  project: { label: "Project", className: "bg-blue-100 text-blue-700" },
  team: { label: "Team", className: "bg-emerald-100 text-emerald-700" },
  system: { label: "System", className: "bg-gray-100 text-gray-700" },
};

export function DashboardActivity() {
  const activityQuery = useActivities();
  const activities = activityQuery.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity</CardTitle>
      </CardHeader>
      <CardContent>
        {activityQuery.isLoading ? (
          <div className="text-sm text-muted-foreground">Loading...</div>
        ) : null}
        {activityQuery.isError ? <div className="text-sm text-red-600">Failed to load</div> : null}
        {!activityQuery.isLoading && activities.length === 0 ? (
          <EmptyState title="No activity yet." description="Recent changes will show up here." />
        ) : null}
        {activities.length > 0 ? (
          <ul className="space-y-4">
            {activities.map((activity) => {
              const type = typeStyles[activity.type];
              return (
                <li key={activity.id} className="flex items-start gap-3">
                  <Badge className={type?.className}>{type?.label ?? "Activity"}</Badge>
                  <div className="space-y-1">
                    <div className="text-sm">{activity.message}</div>
                    <div className="text-xs text-muted-foreground">
                      {activity.actor ? activity.actor.name : "System"} • {activity.createdAt}
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
