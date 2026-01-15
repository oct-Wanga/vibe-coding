import {Button, Card, CardContent, CardHeader, CardTitle} from "@/shared/ui";
import {AppShell} from "@/widgets/app-shell";
import {DashboardLayout} from "@/widgets/dashboard-layout";

export function DashboardView() {
  return (
    <AppShell>
      <DashboardLayout
        title="Dashboard"
        actions={<Button variant="outline">Refresh</Button>}
      >
        <Card>
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            shadcn/ui Card + Button 적용 예시
          </CardContent>
        </Card>
      </DashboardLayout>
    </AppShell>
  );
}
