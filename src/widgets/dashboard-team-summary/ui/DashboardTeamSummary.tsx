"use client";

import { getUserDisplayName, UserAvatar, useTeamMembers } from "@/entities/user";
import { Badge, Card, CardContent, CardHeader, CardTitle, EmptyState } from "@/shared/ui";

export function DashboardTeamSummary() {
  const teamQuery = useTeamMembers();
  const members = teamQuery.data ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team</CardTitle>
      </CardHeader>
      <CardContent>
        {teamQuery.isLoading ? <div className="text-sm text-muted-foreground">Loading...</div> : null}
        {teamQuery.isError ? <div className="text-sm text-red-600">Failed to load</div> : null}
        {!teamQuery.isLoading && members.length === 0 ? (
          <EmptyState title="No team members." description="Invite teammates to get started." />
        ) : null}
        {members.length > 0 ? (
          <ul className="space-y-3">
            {members.map((member) => (
              <li key={member.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <UserAvatar user={member} size={32} />
                  <div>
                    <div className="text-sm font-medium">{getUserDisplayName(member)}</div>
                    <div className="text-xs text-muted-foreground">{member.email}</div>
                  </div>
                </div>
                <Badge variant={member.role === "admin" ? "default" : "secondary"}>
                  {member.role ?? "member"}
                </Badge>
              </li>
            ))}
          </ul>
        ) : null}
      </CardContent>
    </Card>
  );
}
