import { Button } from "@/shared/ui";
import { DashboardActivity } from "@/widgets/dashboard-activity";
import { DashboardKpis } from "@/widgets/dashboard-kpis";
import { DashboardLayout } from "@/widgets/dashboard-layout";
import { DashboardRecentProjects } from "@/widgets/dashboard-recent-projects";
import { DashboardTeamSummary } from "@/widgets/dashboard-team-summary";

export function DashboardView() {
  return (
    <DashboardLayout title="Dashboard" actions={<Button variant="outline">Refresh</Button>}>
      <div className="space-y-6">
        <DashboardKpis />
        <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
          <DashboardRecentProjects />
          <DashboardTeamSummary />
        </div>
        <DashboardActivity />
      </div>
    </DashboardLayout>
  );
}
